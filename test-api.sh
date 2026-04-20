#!/bin/bash
# test-api.sh - Script de test des endpoints API
# Usage: bash test-api.sh

API_URL="http://localhost:3000"

echo "🧪 Test des endpoints AgriTrack API"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Dashboard
echo -e "${YELLOW}1. Test GET /dashboard${NC}"
curl -s "$API_URL/dashboard" | jq '.' || echo "ERREUR"
echo ""

# Test 2: Lister les clients
echo -e "${YELLOW}2. Test GET /clients${NC}"
curl -s "$API_URL/clients" | jq '.' || echo "ERREUR"
echo ""

# Test 3: Créer un client
echo -e "${YELLOW}3. Test POST /clients${NC}"
CLIENT_ID=$(curl -s -X POST "$API_URL/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Marché Central",
    "telephone": "01 23 45 67 89",
    "adresse": "Paris"
  }' | jq -r '.id')

echo "Client créé: $CLIENT_ID"
echo ""

# Test 4: Lister les stocks
echo -e "${YELLOW}4. Test GET /inventory${NC}"
curl -s "$API_URL/inventory" | jq '.' || echo "ERREUR"
echo ""

# Test 5: Ajouter un stock
echo -e "${YELLOW}5. Test POST /inventory${NC}"
INVENTORY_ID=$(curl -s -X POST "$API_URL/inventory" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_paniers": 20,
    "poids_moyen_panier": 5.5
  }' | jq -r '.id')

echo "Stock créé: $INVENTORY_ID"
echo ""

# Test 6: Lister les livraisons
echo -e "${YELLOW}6. Test GET /deliveries${NC}"
curl -s "$API_URL/deliveries" | jq '.' || echo "ERREUR"
echo ""

# Test 7: Créer une livraison
echo -e "${YELLOW}7. Test POST /deliveries${NC}"
DELIVERY_ID=$(curl -s -X POST "$API_URL/deliveries" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"lieu\": \"Marché de Paris\",
    \"quantite_kg\": 25.5,
    \"client_id\": \"$CLIENT_ID\"
  }" | jq -r '.id')

echo "Livraison créée: $DELIVERY_ID"
echo ""

# Test 8: Dashboard mis à jour
echo -e "${YELLOW}8. Test GET /dashboard (après données)${NC}"
curl -s "$API_URL/dashboard" | jq '.' || echo "ERREUR"
echo ""

# Test 9: Mettre à jour le client
echo -e "${YELLOW}9. Test PATCH /clients/:id${NC}"
curl -s -X PATCH "$API_URL/clients/$CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "01 98 76 54 32"
  }' | jq '.' || echo "ERREUR"
echo ""

# Test 10: Supprimer la livraison
echo -e "${YELLOW}10. Test DELETE /deliveries/:id${NC}"
curl -s -X DELETE "$API_URL/deliveries/$DELIVERY_ID" | jq '.' || echo "ERREUR"
echo ""

# Test 11: Vérifier que la livraison est supprimée
echo -e "${YELLOW}11. Test GET /deliveries (après suppression)${NC}"
curl -s "$API_URL/deliveries" | jq '.' || echo "ERREUR"
echo ""

echo -e "${GREEN}✅ Tests terminés!${NC}"
