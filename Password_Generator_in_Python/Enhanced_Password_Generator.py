import random
import string
import datetime
from pathlib import Path

def check_password_strength(password):
    """Simple password strength checker"""
    score = 0
    feedback = []
    
    if len(password) >= 12:
        score += 2
    elif len(password) >= 8:
        score += 1
    else:
        feedback.append("Too short")
    
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(c in string.punctuation for c in password):
        score += 1
    
    if score >= 5:
        return "Strong 💪", "Excellent password!"
    elif score >= 3:
        return "Medium ⚠️", "Good, but can be stronger."
    else:
        return "Weak ❌", "Consider making it longer or more complex."


def generate_password(length=12, mode="mixed"):
    """Generate password with guaranteed character types"""
    letters = string.ascii_letters
    digits = string.digits
    symbols = string.punctuation
    
    if mode == "letters":
        chars = letters
        password = [random.choice(letters) for _ in range(length)]
    elif mode == "numbers":
        chars = digits
        password = [random.choice(digits) for _ in range(length)]
    else:  # mixed (default)
        chars = letters + digits + symbols
        password = []
        
        # Guarantee at least one of each type
        password.append(random.choice(string.ascii_lowercase))
        password.append(random.choice(string.ascii_uppercase))
        password.append(random.choice(digits))
        if symbols:  # only add symbol if we want them
            password.append(random.choice(symbols))
        
        # Fill the rest
        remaining = length - len(password)
        password.extend(random.choice(chars) for _ in range(remaining))
    
    # Shuffle to make it random
    random.shuffle(password)
    return ''.join(password)


def save_to_file(password):
    """Save password to passwords.txt"""
    file_path = Path("passwords.txt")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {password}\n")
    
    print(f"💾 Password saved to {file_path}")


def main():
    print("🔐 Advanced Password Generator")
    print("=" * 40)
    
    # Length
    while True:
        try:
            length = int(input("\nEnter password length (min 6): "))
            if length >= 6:
                break
            print("❌ Minimum length is 6.")
        except ValueError:
            print("❌ Please enter a valid number.")
    
    # Mode selection
    print("\nChoose password type:")
    print("1. Mixed (Letters + Numbers + Symbols) - Recommended")
    print("2. Letters only")
    print("3. Numbers only")
    
    while True:
        choice = input("Enter choice (1-3): ")
        if choice == "1":
            mode = "mixed"
            break
        elif choice == "2":
            mode = "letters"
            break
        elif choice == "3":
            mode = "numbers"
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")
    
    # Generate password
    password = generate_password(length, mode)
    
    # Show password + strength
    strength, feedback = check_password_strength(password)
    print("\n✅ Generated Password:")
    print(password)
    print(f"Strength: {strength} - {feedback}")
    
    # Copy to clipboard
    try:
        import pyperclip
        pyperclip.copy(password)
        print("📋 Password copied to clipboard!")
    except ImportError:
        print("💡 To enable clipboard: pip install pyperclip")
    
    # Save to file
    save_choice = input("\nSave this password to file? (y/n): ").lower()
    if save_choice == 'y':
        save_to_file(password)
    
    print("\n🔄 Run again to generate another password!")


if __name__ == "__main__":
    main()