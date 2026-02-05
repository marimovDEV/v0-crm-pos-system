from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
import django_filters
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer

# Define FilterSet for Sales
class SaleFilter(django_filters.FilterSet):
    min_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='gte')
    max_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='lte')
    payment_method = django_filters.CharFilter(field_name="payment_method")
    branch = django_filters.NumberFilter(field_name="branch_id")
    
    class Meta:
        model = Sale
        fields = ['payment_method', 'min_date', 'max_date', 'branch']

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    filterset_class = SaleFilter
    search_fields = ['receipt_id', 'customer__name']

    def get_queryset(self):
        user = self.request.user
        queryset = Sale.objects.all().order_by('-created_at')
        
        if not user.is_authenticated:
            return queryset.none()

        try:
            employee = user.employee_profile
            if employee.role != 'super_admin' and employee.branch:
                queryset = queryset.filter(branch=employee.branch)
        except:
            pass
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        branch_id = self.request.data.get('branch')
        
        save_kwargs = {'cashier': user}
        
        # If branch is explicitly provided (e.g. by admin selecting in POS), use it
        if branch_id:
            from core.models import Branch
            try:
                branch = Branch.objects.get(id=branch_id)
                save_kwargs['branch'] = branch
            except Branch.DoesNotExist:
                pass
        
        # Fallback to employee's assigned branch if not already set
        if 'branch' not in save_kwargs:
            try:
                employee = user.employee_profile
                if employee.branch:
                    save_kwargs['branch'] = employee.branch
            except:
                pass

        serializer.save(**save_kwargs)

class SaleItemViewSet(viewsets.ModelViewSet):
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer
    filterset_fields = ['sale', 'product']

class DashboardStatsView(views.APIView):
    def get(self, request):
        today = timezone.now().date()
        start_of_today = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        
        branch_id = request.query_params.get('branch')
        
        # Base Querysets
        sales_qs = Sale.objects.all()
        from products.models import Product
        products_qs = Product.objects.all()
        from customers.models import Customer
        customers_qs = Customer.objects.all()

        if branch_id and branch_id != 'all':
            sales_qs = sales_qs.filter(branch_id=branch_id)
            products_qs = products_qs.filter(branch_id=branch_id)
            customers_qs = customers_qs.filter(branch_id=branch_id)

        # Today's Sales
        today_sales = sales_qs.filter(created_at__gte=start_of_today)
        today_total = today_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        # Calculate daily profit (using historical cost from SaleItem)
        today_profit = 0
        today_items = SaleItem.objects.filter(sale__in=today_sales)
        for item in today_items:
            # Profit = (Sale Price - Cost Price at Sale) * Qty
            today_profit += (item.price - item.cost_price_at_sale) * item.quantity

        # Total Debt (Global or Branch specific)
        total_debt = customers_qs.aggregate(Sum('debt'))['debt__sum'] or 0

        # Low Stock Products
        low_stock = products_qs.filter(stock__lte=F('min_stock')).values(
            'id', 'name', 'stock', 'base_unit', 'min_stock'
        )[:5]

        # Top Selling Products Today
        top_products = today_items.values('product__name').annotate(
            quantity=Sum('quantity')
        ).order_by('-quantity')[:5]

        # Chart Data (for dashboard simple chart - last 7 days)
        chart_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            day_sales = sales_qs.filter(created_at__range=(day_start, day_end))
            day_total = day_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            chart_data.append({
                'name': day.strftime('%d.%m'),
                'total': float(day_total)
            })

        data = {
            'today_sales': float(today_total),
            'today_profit': float(today_profit),
            'total_debt': float(total_debt),
            'low_stock_products': list(low_stock),
            'top_products': list(top_products),
            'chart_data': chart_data
        }
        return Response(data)

class ReportsView(views.APIView):
    def get(self, request):
        # Filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        branch_id = request.query_params.get('branch')
        cashier_id = request.query_params.get('cashier_id')

        sales_qs = Sale.objects.all()

        if start_date:
            sales_qs = sales_qs.filter(created_at__gte=start_date)
        if end_date:
            sales_qs = sales_qs.filter(created_at__lte=end_date)
        if branch_id and branch_id != 'all':
            sales_qs = sales_qs.filter(branch_id=branch_id)
        if cashier_id:
            sales_qs = sales_qs.filter(cashier_id=cashier_id)

        # Aggregations
        total_sales = sales_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        sale_count = sales_qs.count()
        avg_check = float(total_sales) / sale_count if sale_count > 0 else 0

        # Profit calculation using historical cost
        profit = 0
        items_qs = SaleItem.objects.filter(sale__in=sales_qs)
        for item in items_qs:
            profit += (item.price - item.cost_price_at_sale) * item.quantity
        
        margin = (float(profit) / float(total_sales) * 100) if total_sales > 0 else 0

        # Top Products
        top_products = items_qs.values('product__name').annotate(
            qty=Sum('quantity'),
            total=Sum('total')
        ).order_by('-qty')[:10]

        # Top Employees
        top_employees = sales_qs.values('cashier__username', 'branch__name').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total')

        # Branch Stats
        branch_stats = sales_qs.values('branch__name').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('-total')

        # Chart Data (Daily for last 15 days)
        chart_data = []
        now = timezone.now()
        for i in range(14, -1, -1):
            day = now.date() - timedelta(days=i)
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            day_sales_qs = sales_qs.filter(created_at__range=(day_start, day_end))
            day_total = day_sales_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            day_profit = 0
            day_items = SaleItem.objects.filter(sale__in=day_sales_qs)
            for item in day_items:
                day_profit += (item.price - item.cost_price_at_sale) * item.quantity
            
            chart_data.append({
                'name': day.strftime('%d.%m'),
                'sales': float(day_total),
                'profit': float(day_profit)
            })

        return Response({
            'overview': {
                'total_sales': float(total_sales),
                'sale_count': sale_count,
                'total_profit': float(profit),
                'margin': round(float(margin), 2),
                'avg_check': round(float(avg_check), 2),
            },
            'top_products': list(top_products),
            'employee_stats': list(top_employees),
            'branch_stats': list(branch_stats),
            'chart_data': chart_data
        })

class AuditLogView(views.APIView):
    def get(self, request):
        from core.models import AuditLog
        from core.serializers import AuditLogSerializer
        
        logs = AuditLog.objects.all().order_by('-timestamp')
        
        # Simple filtering
        branch_id = request.query_params.get('branch')
        if branch_id and branch_id != 'all':
            logs = logs.filter(branch_id=branch_id)
            
        serializer = AuditLogSerializer(logs[:100], many=True)
        return Response(serializer.data)
