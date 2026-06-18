# test-api.ps1 - Script de test des endpoints API (Windows PowerShell)
# Usage: .\test-api.ps1

$API_URL = "http://localhost:3000"

Write-Host "🧪 Test des endpoints AgriTrack API" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Dashboard
Write-Host "1. Test GET /dashboard" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/dashboard" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 2: Lister les clients
Write-Host "2. Test GET /clients" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/clients" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 3: Créer un client
Write-Host "3. Test POST /clients" -ForegroundColor Yellow
$clientData = @{
    nom = "Marché Central"
    telephone = "01 23 45 67 89"
    adresse = "Paris"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_URL/clients" `
    -Method Post `
    -ContentType "application/json" `
    -Body $clientData

$client = $response.Content | ConvertFrom-Json
$CLIENT_ID = $client.id
Write-Host "Client créé: $CLIENT_ID" -ForegroundColor Green
Write-Host ""

# Test 4: Lister les stocks
Write-Host "4. Test GET /inventory" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/inventory" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 5: Ajouter un stock
Write-Host "5. Test POST /inventory" -ForegroundColor Yellow
$inventoryData = @{
    nombre_paniers = 20
    poids_moyen_panier = 5.5
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_URL/inventory" `
    -Method Post `
    -ContentType "application/json" `
    -Body $inventoryData

$inventory = $response.Content | ConvertFrom-Json
$INVENTORY_ID = $inventory.id
Write-Host "Stock créé: $INVENTORY_ID" -ForegroundColor Green
Write-Host ""

# Test 6: Lister les livraisons
Write-Host "6. Test GET /deliveries" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/deliveries" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 7: Créer une livraison
Write-Host "7. Test POST /deliveries" -ForegroundColor Yellow
$deliveryData = @{
    date = (Get-Date).ToUniversalTime().ToString("o")
    lieu = "Marché de Paris"
    quantite_kg = 25.5
    client_id = $CLIENT_ID
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_URL/deliveries" `
    -Method Post `
    -ContentType "application/json" `
    -Body $deliveryData

$delivery = $response.Content | ConvertFrom-Json
$DELIVERY_ID = $delivery.id
Write-Host "Livraison créée: $DELIVERY_ID" -ForegroundColor Green
Write-Host ""

# Test 8: Dashboard mis à jour
Write-Host "8. Test GET /dashboard (après données)" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/dashboard" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 9: Mettre à jour le client
Write-Host "9. Test PATCH /clients/:id" -ForegroundColor Yellow
$updateData = @{
    telephone = "01 98 76 54 32"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_URL/clients/$CLIENT_ID" `
    -Method Patch `
    -ContentType "application/json" `
    -Body $updateData

Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

# Test 10: Supprimer la livraison
Write-Host "10. Test DELETE /deliveries/:id" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$API_URL/deliveries/$DELIVERY_ID" -Method Delete
Write-Host "Livraison supprimée ✓" -ForegroundColor Green
Write-Host ""

# Test 11: Vérifier que la livraison est supprimée
Write-Host "11. Test GET /deliveries (après suppression)" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/deliveries" -Method Get
Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
Write-Host ""

Write-Host "✅ Tests terminés!" -ForegroundColor Green
