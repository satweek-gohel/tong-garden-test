from fastapi import status


class TestOrderFlow:
    def test_complete_order_creation_flow(self, client, sample_user, sample_product, auth_headers):
        order_response = client.post(
            "/api/v1/orders",
            json={"user_id": sample_user.id},
            headers=auth_headers,
        )
        assert order_response.status_code == status.HTTP_201_CREATED
        order_id = order_response.json()["id"]

        item_response = client.post(
            f"/api/v1/orders/{order_id}/items",
            json={"product_id": sample_product.id, "quantity": 2},
            headers=auth_headers,
        )
        assert item_response.status_code == status.HTTP_201_CREATED

        order_after_item = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers).json()
        expected_total = float(sample_product.price) * 2
        assert float(order_after_item["total_amount"]) == expected_total

        payment_response = client.post(
            f"/api/v1/orders/{order_id}/payment",
            json={"amount": expected_total, "payment_method": "credit_card"},
            headers=auth_headers,
        )
        assert payment_response.status_code == status.HTTP_200_OK
        assert payment_response.json()["status"] == "success"

        final_order = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers).json()
        assert final_order["payment_status"] == "completed"
        assert final_order["status"] == "confirmed"

    def test_insufficient_stock_rejected(self, client, sample_user, sample_product, auth_headers):
        order_response = client.post("/api/v1/orders", json={"user_id": sample_user.id}, headers=auth_headers)
        order_id = order_response.json()["id"]

        response = client.post(
            f"/api/v1/orders/{order_id}/items",
            json={"product_id": sample_product.id, "quantity": sample_product.stock_quantity + 1},
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_orders_require_auth(self, client):
        response = client.get("/api/v1/orders")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
