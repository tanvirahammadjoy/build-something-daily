import random
import string
import datetime
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox

# Try to import pyperclip for clipboard
try:
    import pyperclip
    CLIPBOARD_AVAILABLE = True
except ImportError:
    CLIPBOARD_AVAILABLE = False


class PasswordGeneratorGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🔐 Password Generator")
        self.root.geometry("500x580")
        self.root.resizable(False, False)
        
        self.create_widgets()
    
    def create_widgets(self):
        # Title
        title = tk.Label(self.root, text="Password Generator", font=("Arial", 18, "bold"))
        title.pack(pady=15)
        
        # Length
        frame1 = tk.Frame(self.root)
        frame1.pack(fill="x", padx=30, pady=10)
        
        tk.Label(frame1, text="Password Length:", font=("Arial", 11)).pack(anchor="w")
        self.length_var = tk.IntVar(value=12)
        self.length_spin = tk.Spinbox(frame1, from_=6, to=64, textvariable=self.length_var, width=10, font=("Arial", 11))
        self.length_spin.pack(anchor="w", pady=5)
        
        # Mode
        frame2 = tk.Frame(self.root)
        frame2.pack(fill="x", padx=30, pady=10)
        
        tk.Label(frame2, text="Password Type:", font=("Arial", 11)).pack(anchor="w")
        
        self.mode_var = tk.StringVar(value="mixed")
        
        modes = [
            ("Mixed (Recommended)", "mixed"),
            ("Letters Only", "letters"),
            ("Numbers Only", "numbers")
        ]
        
        for text, value in modes:
            tk.Radiobutton(frame2, text=text, variable=self.mode_var, value=value, font=("Arial", 10)).pack(anchor="w")
        
        # Generate Button
        generate_btn = tk.Button(self.root, text="Generate Password", font=("Arial", 12, "bold"), 
                               bg="#4CAF50", fg="white", height=2, command=self.generate)
        generate_btn.pack(pady=20, fill="x", padx=40)
        
        # Password Display
        tk.Label(self.root, text="Generated Password:", font=("Arial", 11)).pack(anchor="w", padx=30)
        
        self.password_var = tk.StringVar()
        self.password_entry = tk.Entry(self.root, textvariable=self.password_var, font=("Consolas", 14), 
                                     justify="center", state="readonly", readonlybackground="white")
        self.password_entry.pack(fill="x", padx=30, pady=8, ipady=8)
        
        # Strength
        self.strength_var = tk.StringVar(value="Strength: -")
        self.strength_label = tk.Label(self.root, textvariable=self.strength_var, font=("Arial", 11, "bold"))
        self.strength_label.pack(pady=5)
        
        # Buttons Frame
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=15)
        
        tk.Button(btn_frame, text="Copy to Clipboard", command=self.copy_to_clipboard, 
                 bg="#2196F3", fg="white", width=15).grid(row=0, column=0, padx=8)
        
        tk.Button(btn_frame, text="Save to File", command=self.save_password, 
                 bg="#FF9800", fg="white", width=15).grid(row=0, column=1, padx=8)
        
        # Status
        self.status_var = tk.StringVar()
        self.status_label = tk.Label(self.root, textvariable=self.status_var, fg="green", font=("Arial", 10))
        self.status_label.pack(pady=10)
        
        # Footer
        tk.Label(self.root, text="Made for learning Python GUI", fg="gray").pack(side="bottom", pady=10)
    
    def check_strength(self, password):
        score = 0
        if len(password) >= 12: score += 2
        elif len(password) >= 8: score += 1
        
        if any(c.isupper() for c in password): score += 1
        if any(c.islower() for c in password): score += 1
        if any(c.isdigit() for c in password): score += 1
        if any(c in string.punctuation for c in password): score += 1
        
        if score >= 5:
            return "Strong 💪", "green"
        elif score >= 3:
            return "Medium ⚠️", "orange"
        else:
            return "Weak ❌", "red"
    
    def generate(self):
        length = self.length_var.get()
        mode = self.mode_var.get()
        
        # Generate password (same logic as before)
        if mode == "letters":
            chars = string.ascii_letters
            password_list = [random.choice(chars) for _ in range(length)]
        elif mode == "numbers":
            chars = string.digits
            password_list = [random.choice(chars) for _ in range(length)]
        else:  # mixed
            password_list = [
                random.choice(string.ascii_lowercase),
                random.choice(string.ascii_uppercase),
                random.choice(string.digits),
                random.choice(string.punctuation)
            ]
            remaining = length - 4
            all_chars = string.ascii_letters + string.digits + string.punctuation
            password_list.extend(random.choice(all_chars) for _ in range(remaining))
            random.shuffle(password_list)
        
        password = ''.join(password_list)
        
        # Update GUI
        self.password_var.set(password)
        strength_text, color = self.check_strength(password)
        self.strength_var.set(f"Strength: {strength_text}")
        self.strength_label.config(fg=color)
        
        self.status_var.set("✅ New password generated!")
        self.root.after(3000, lambda: self.status_var.set(""))
    
    def copy_to_clipboard(self):
        password = self.password_var.get()
        if not password:
            messagebox.showwarning("Warning", "Generate a password first!")
            return
        
        if CLIPBOARD_AVAILABLE:
            pyperclip.copy(password)
            self.status_var.set("📋 Copied to clipboard!")
        else:
            messagebox.showinfo("Info", "pyperclip is not installed.\nUse: pip install pyperclip")
        
        self.root.after(2500, lambda: self.status_var.set(""))
    
    def save_password(self):
        password = self.password_var.get()
        if not password:
            messagebox.showwarning("Warning", "Generate a password first!")
            return
        
        try:
            file_path = Path("passwords.txt")
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            with open(file_path, "a", encoding="utf-8") as f:
                f.write(f"[{timestamp}] {password}\n")
            
            messagebox.showinfo("Success", f"Password saved to:\n{file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save: {e}")
    
    def run(self):
        self.root.mainloop()


# Run the GUI
if __name__ == "__main__":
    app = PasswordGeneratorGUI()
    app.run()
    