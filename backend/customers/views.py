from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, DebtTransaction
from .serializers import CustomerSerializer, DebtTransactionSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    search_fields = ['name', 'phone']

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        customer = self.get_object()
        transactions = customer.transactions.all().order_by('-date')
        serializer = DebtTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

class DebtTransactionViewSet(viewsets.ModelViewSet):
    queryset = DebtTransaction.objects.all()
    serializer_class = DebtTransactionSerializer
    filterset_fields = ['customer', 'transaction_type']
    ordering_fields = ['date']
    ordering = ['-date']

