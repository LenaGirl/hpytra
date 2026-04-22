from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="帳號已被註冊",
            )
        ],
    )

    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email已被註冊",
            )
        ],
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    password2 = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password2")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "兩次輸入的密碼不一致"})
        return data

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data["identifier"]
        password = data["password"]

        # Email 或 帳號登入
        user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()

        if not user:
            raise serializers.ValidationError("帳號或密碼錯誤")

        # 驗證帳號密碼
        user = authenticate(username=user.username, password=password)

        if not user:
            raise serializers.ValidationError("帳號或密碼錯誤")

        data["user"] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError("目前密碼錯誤")

        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def save(self):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        return user
