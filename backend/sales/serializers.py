from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Sale, SaleItem
from products.models import Product
from customers.models import Customer
from decimal import Decimal

User = get_user_model()

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'total']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')
    branch_name = serializers.ReadOnlyField(source='branch.name')
    receipt_id = serializers.CharField(read_only=True)
    cashier = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Sale
        fields = ['id', 'receipt_id', 'customer', 'customer_name', 'total_amount', 'discount_amount', 'payment_method', 'cashier', 'branch', 'branch_name', 'created_at', 'items']
        read_only_fields = ['receipt_id', 'branch', 'branch_name', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Determine cashier if not provided (fallback to request.user)
        if 'cashier' not in validated_data and 'request' in self.context:
            validated_data['cashier'] = self.context['request'].user

        sale = Sale.objects.create(**validated_data)
        
        from products.models import StockMovement
        from core.models import AuditLog

        for item_data in items_data:
            product = item_data['product']
            SaleItem.objects.create(
                sale=sale, 
                cost_price_at_sale=product.cost_price if product else 0,
                **item_data
            )
            
            # Logic to update stock and log movement
            if product:
                StockMovement.objects.create(
                    product=product,
                    type='out',
                    quantity=-item_data['quantity'],
                    branch=sale.branch,
                    user=sale.cashier,
                    doc_number=sale.receipt_id,
                    reason=f"Sotuv: {sale.receipt_id}"
                )
                product.stock -= item_data['quantity']
                product.save()

        # Audit Log for the sale
        AuditLog.objects.create(
            user=sale.cashier,
            action_type='sale',
            description=f"Yangi savdo: {sale.receipt_id} ({sale.total_amount} so'm)",
            branch=sale.branch,
            metadata={'receipt_id': sale.receipt_id, 'amount': float(sale.total_amount)}
        )

        # Logic to update customer debt
        if sale.payment_method == 'debt' and sale.customer:
            from customers.models import DebtTransaction
            DebtTransaction.objects.create(
                customer=sale.customer,
                transaction_type='debt_added',
                amount=sale.total_amount,
                note=f"Sotuv {sale.receipt_id}",
                sale_id=sale.receipt_id
            )
            sale.customer.debt += Decimal(str(sale.total_amount))
            sale.customer.save()

        return sale
