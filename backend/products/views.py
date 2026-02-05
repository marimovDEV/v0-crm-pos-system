from rest_framework import viewsets
from .models import Product, StockMovement, Category
from .serializers import ProductSerializer, StockMovementSerializer, CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    search_fields = ['name', 'sku']
    filterset_fields = ['category', 'branch']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        from django.db.models import Sum, F, Avg
        
        total_products = queryset.count()
        # Calculate total value of stock (stock * sale_price)
        # Note: SQLite might struggle with efficient sums but it's fine for now
        total_value = sum(p.stock * p.sale_price for p in queryset)
        
        low_stock_count = queryset.filter(stock__lte=F('min_stock')).count()
        
        # Avg Margin
        avg_margin = 0
        products_with_price = [p for p in queryset if p.sale_price > 0]
        if products_with_price:
            margins = [((p.sale_price - p.cost_price) / p.sale_price) * 100 for p in products_with_price]
            avg_margin = sum(margins) / len(margins)

        return Response({
            'totalProducts': total_products,
            'totalValue': total_value,
            'lowStockCount': low_stock_count,
            'avgMargin': round(avg_margin, 1)
        })

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.all()
        
        if not user.is_authenticated:
            return queryset.none()
            
        try:
            employee = user.employee_profile
            # Super admin sees all, others see only their branch
            if employee.role != 'super_admin' and employee.branch:
                queryset = queryset.filter(branch=employee.branch)
        except:
            # If no employee profile (e.g. admin superuser), show all
            pass
            
        return queryset

    def perform_create(self, serializer):
        # Auto-assign branch if not provided and user is not super_admin
        user = self.request.user
        try:
            employee = user.employee_profile
            if employee.role != 'super_admin' and employee.branch:
                serializer.save(branch=employee.branch)
            else:
                serializer.save()
        except:
            serializer.save()

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    filterset_fields = ['type', 'branch', 'product']

    def get_queryset(self):
        user = self.request.user
        queryset = StockMovement.objects.all().order_by('-date')
        
        if not user.is_authenticated:
            return queryset.none()

        try:
            employee = user.employee_profile
            if employee.role != 'super_admin' and employee.branch:
                queryset = queryset.filter(branch=employee.branch)
        except:
            pass
            
        return queryset
