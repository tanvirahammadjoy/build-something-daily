import random
import string

def generate_password(length, use_symbols=True):
    """Generate a random password"""
    # Define character sets
    letters = string.ascii_letters  # a-z A-Z
    digits = string.digits           # 0-9
    symbols = string.punctuation     # !@#$%^&* etc.
    
    # Start with letters + digits
    characters = letters + digits
    
    # Add symbols if user wants them
    if use_symbols:
        characters += symbols
    
    # Generate password using random choices
    password = ''.join(random.choice(characters) for _ in range(length))
    
    return password


def main():
    print("🔐 Password Generator")
    print("=" * 30)
    
    # Get length from user
    while True:
        try:
            length = int(input("\nEnter password length (min 6): "))
            if length >= 6:
                break
            else:
                print("❌ Password must be at least 6 characters long.")
        except ValueError:
            print("❌ Please enter a valid number.")
    
    # Ask about symbols
    use_symbols = input("Include symbols? (y/n): ").lower() == 'y'
    
    # Generate password
    password = generate_password(length, use_symbols)
    
    print("\n✅ Generated Password:")
    print(password)
    
    # Copy to clipboard (optional - requires pyperclip)
    try:
        import pyperclip
        pyperclip.copy(password)
        print("\n📋 Password copied to clipboard!")
    except ImportError:
        print("\n💡 Tip: Install pyperclip to enable copy feature:")
        print("   pip install pyperclip")


if __name__ == "__main__":
    main()