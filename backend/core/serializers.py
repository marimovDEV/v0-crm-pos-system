from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, AuditLog, Branch, StoreSettings

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    full_name = serializers.ReadOnlyField(source='user.get_full_name')
    branch_name = serializers.ReadOnlyField(source='branch.name')

    class Meta:
        model = Employee
        fields = ['id', 'username', 'full_name', 'branch', 'branch_name', 'position', 'role', 'phone', 'salary']

class UserWithEmployeeSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(source='employee_profile', read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.CharField(source='employee_profile.role', required=False)
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), source='employee_profile.branch', required=False)
    position = serializers.CharField(source='employee_profile.position', required=False)
    phone = serializers.CharField(source='employee_profile.phone', required=False)
    full_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'password', 'employee', 'role', 'branch', 'position', 'phone']

    def create(self, validated_data):
        employee_data = validated_data.pop('employee_profile', {})
        password = validated_data.pop('password', '12345')
        full_name = validated_data.pop('full_name', '')
        
        if full_name:
            parts = full_name.split(' ', 1)
            validated_data['first_name'] = parts[0]
            if len(parts) > 1:
                validated_data['last_name'] = parts[1]

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        Employee.objects.create(user=user, **employee_data)
        return user

    def update(self, instance, validated_data):
        employee_data = validated_data.pop('employee_profile', {})
        password = validated_data.pop('password', None)
        full_name = validated_data.pop('full_name', None)

        if full_name:
            parts = full_name.split(' ', 1)
            instance.first_name = parts[0]
            if len(parts) > 1:
                instance.last_name = parts[1]
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        employee = instance.employee_profile
        for attr, value in employee_data.items():
            setattr(employee, attr, value)
        employee.save()
        
        return instance

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    branch_name = serializers.ReadOnlyField(source='branch.name')

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'username', 'action_type', 'description', 'branch', 'branch_name', 'timestamp', 'metadata']
