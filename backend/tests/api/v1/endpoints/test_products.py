from fastapi import status


class TestProductEndpoints:
    def test_create_product(self, client, sample_category, auth_headers):
        response = client.post(
            "/api/v1/products",
            json={
                "sku": "SNK-002",
                "name": "Cashew Pack 150g",
                "description": "Roasted cashews",
                "price": 3.49,
                "cost": 1.50,
                "stock_quantity": 200,
                "category_id": sample_category.id,
            },
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["sku"] == "SNK-002"

    def test_create_product_requires_auth(self, client, sample_category):
        response = client.post(
            "/api/v1/products",
            json={
                "sku": "SNK-003",
                "name": "Almonds 200g",
                "price": 4.99,
                "category_id": sample_category.id,
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_product_duplicate_sku(self, client, sample_product, auth_headers):
        response = client.post(
            "/api/v1/products",
            json={
                "sku": sample_product.sku,
                "name": "Another Product",
                "price": 2.99,
                "category_id": sample_product.category_id,
            },
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_get_product(self, client, sample_product, auth_headers):
        response = client.get(f"/api/v1/products/{sample_product.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == sample_product.name

    def test_list_products_with_pagination(self, client, sample_product, auth_headers):
        response = client.get("/api/v1/products?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    def test_search_products(self, client, sample_product, auth_headers):
        response = client.get(f"/api/v1/products/search?q={sample_product.name[:4]}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) > 0

    def test_update_product_stock(self, client, sample_product, auth_headers):
        initial_quantity = sample_product.stock_quantity
        response = client.patch(
            f"/api/v1/products/{sample_product.id}/stock",
            json={"quantity_change": -50, "reason": "manual adjustment"},
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["stock_quantity"] == initial_quantity - 50

    def test_delete_product(self, client, sample_product, auth_headers):
        response = client.delete(f"/api/v1/products/{sample_product.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        get_response = client.get(f"/api/v1/products/{sample_product.id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
