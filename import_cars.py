import requests
import random
import time
from faker import Faker

# Initialize faker
fake = Faker()

# API endpoint
URL = "http://localhost:7700/api/v1/cars"

# Replace with your actual token
TOKEN = "dddd"

# Headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

# Car makes and their associated models
car_data = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "4Runner", "Tacoma", "Sienna"],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V", "Ridgeline"],
    "Ford": ["F-150", "Escape", "Explorer", "Mustang", "Edge", "Ranger", "Bronco"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Traverse", "Suburban", "Colorado"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series", "X1", "M3", "M5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLA", "A-Class"],
    "Audi": ["A4", "A6", "Q5", "Q7", "A3", "e-tron", "Q3", "A8"],
    "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Frontier", "Maxima"],
    "Hyundai": ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade", "Venue"],
    "Kia": ["Sorento", "Sportage", "Forte", "Telluride", "Soul", "Seltos", "K5"],
    "Subaru": ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "Legacy", "WRX"],
    "Volkswagen": ["Jetta", "Tiguan", "Atlas", "Passat", "Taos", "Golf", "ID.4"],
    "Lexus": ["RX", "NX", "ES", "IS", "GX", "UX", "LS"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Mazda": ["CX-5", "Mazda3", "CX-9", "Mazda6", "CX-30", "MX-5 Miata"]
}

# Car colors
colors = ["Red", "Blue", "Black", "White", "Silver", "Gray", "Green", "Yellow", "Orange", 
          "Brown", "Purple", "Beige", "Champagne", "Burgundy", "Navy", "Charcoal", "Gold"]

# Cities
cities = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
    "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "San Francisco, CA",
    "Charlotte, NC", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
    "Boston, MA", "Nashville, TN", "Baltimore, MD", "Oklahoma City, OK", "Portland, OR"
]

def generate_license_plate():
    """Generate a random license plate."""
    letters = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ', k=3))
    numbers = ''.join(random.choices('0123456789', k=3))
    return f"{letters}{numbers}"

def generate_car_data():
    """Generate random car data."""
    make = random.choice(list(car_data.keys()))
    model = random.choice(car_data[make])
    year = random.randint(2015, 2024)
    license_plate = generate_license_plate()
    color = random.choice(colors)
    daily_rate = round(random.uniform(30.0, 150.0), 2)
    location = random.choice(cities)
    
    # Generate a more detailed description based on the car's features
    features = []
    
    # Random features based on car type
    potential_features = [
        "Bluetooth connectivity", "Backup camera", "Sunroof", "Leather seats",
        "Navigation system", "Heated seats", "Third-row seating", "All-wheel drive",
        "Keyless entry", "Push-button start", "Lane departure warning", "Blind spot monitoring",
        "Apple CarPlay", "Android Auto", "Premium sound system", "Panoramic sunroof",
        "Automatic emergency braking", "Adaptive cruise control", "Power liftgate",
        "Remote start", "Wireless charging", "Ventilated seats", "Heads-up display"
    ]
    
    # Select 3-5 random features
    num_features = random.randint(3, 5)
    for _ in range(num_features):
        feature = random.choice(potential_features)
        potential_features.remove(feature)  # Avoid duplicates
        features.append(feature)
    
    # Create a more natural description
    condition = random.choice(["Excellent", "Very good", "Good", "Like new", "Well-maintained"])
    fuel = random.choice(["Fuel-efficient", "Hybrid", "Electric", "Eco-friendly", "Gas-saving"])
    comfort = random.choice(["comfortable", "spacious", "luxurious", "cozy", "elegant"])
    
    description = f"{condition} {year} {make} {model}. {fuel} and {comfort}. " + \
                  f"Features include: {', '.join(features)}."
    
    return {
        "make": make,
        "model": model,
        "year": year,
        "licensePlate": license_plate,
        "color": color,
        "dailyRate": daily_rate,
        "location": location,
        "description": description
    }

def main():
    """Main function to add 100 records."""
    successful = 0
    failed = 0
    
    for i in range(1, 101):
        car_data = generate_car_data()
        try:
            print(f"Adding car #{i}: {car_data['year']} {car_data['make']} {car_data['model']}")
            response = requests.post(URL, headers=headers, json=car_data)
            
            if response.status_code == 201 or response.status_code == 200:
                print(f"✓ Success! ID: {response.json().get('id', 'unknown')}")
                successful += 1
            else:
                print(f"✗ Failed with status code {response.status_code}: {response.text}")
                failed += 1
                
            # Small delay to avoid overwhelming the server
            time.sleep(0.3)
            
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            failed += 1
    
    print(f"\nCompleted: Added {successful} cars successfully, {failed} failed.")

if __name__ == "__main__":
    main()