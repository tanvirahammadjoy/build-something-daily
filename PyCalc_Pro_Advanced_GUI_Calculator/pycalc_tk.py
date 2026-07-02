"""Main application."""

import tkinter as tk
from tkinter import ttk, messagebox
import math
import json
from datetime import datetime

class PyCalcPro:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("PyCalc Pro - Advanced Calculator")
        self.root.geometry("420x680")
        self.root.resizable(False, False)
        
        # Variables
        self.current = tk.StringVar(value="0")
        self.expression = tk.StringVar(value="")
        self.memory = 0.0
        self.history = []
        self.is_scientific = True
        self.dark_mode = True
        
        self.setup_ui()
        self.bind_keyboard()
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = tk.Label(main_frame, text="PyCalc Pro", 
                        font=("Helvetica", 20, "bold"), fg="#00ffcc")
        title.pack(pady=(0, 10))
        
        # Display Frame
        display_frame = tk.Frame(main_frame, bg="#0a0a1f", relief=tk.SUNKEN, bd=2)
        display_frame.pack(fill=tk.X, pady=5)
        
        # Expression
        expr_label = tk.Label(display_frame, textvariable=self.expression, 
                             anchor="e", bg="#0a0a1f", fg="#00ffcc", 
                             font=("Consolas", 14))
        expr_label.pack(fill=tk.X, padx=10, pady=(10, 5))
        
        # Main Display
        display = tk.Label(display_frame, textvariable=self.current, 
                          anchor="e", bg="#0a0a1f", fg="white", 
                          font=("Consolas", 32, "bold"))
        display.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        # History
        history_label = tk.Label(main_frame, text="History", font=("Helvetica", 10))
        history_label.pack(anchor="w", pady=(10, 2))
        
        self.history_text = tk.Text(main_frame, height=6, state='disabled', 
                                   bg="#1e1e2e", fg="#aaaaaa", font=("Consolas", 10))
        self.history_text.pack(fill=tk.X, pady=(0, 10))
        
        # Mode Toggle
        mode_frame = tk.Frame(main_frame)
        mode_frame.pack(fill=tk.X, pady=5)
        
        self.mode_var = tk.BooleanVar(value=self.is_scientific)
        ttk.Radiobutton(mode_frame, text="Basic", variable=self.mode_var, 
                       value=False, command=self.toggle_mode).pack(side=tk.LEFT)
        ttk.Radiobutton(mode_frame, text="Scientific", variable=self.mode_var, 
                       value=True, command=self.toggle_mode).pack(side=tk.LEFT, padx=20)
        
        # Buttons
        self.button_frame = tk.Frame(main_frame)
        self.button_frame.pack(fill=tk.BOTH, expand=True)
        self.create_buttons()
        
    def create_buttons(self):
        for widget in self.button_frame.winfo_children():
            widget.destroy()
        
        buttons = []
        
        if self.is_scientific:
            sci_row = [
                ("MC", "memory_clear"), ("MR", "memory_recall"), ("M+", "memory_add"), 
                ("sin", "sin"), ("cos", "cos"), ("tan", "tan"),
                ("√", "sqrt"), ("x²", "square"), ("log", "log10"), ("ln", "ln")
            ]
            for text, func in sci_row:
                buttons.append((text, lambda x=func: self.scientific_func(x)))
        
        # Main calculator buttons
        main_buttons = [
            ("C", "clear"), ("⌫", "backspace"), ("%", "percent"), ("÷", lambda: self.set_operator('/')),
            ("7", "7"), ("8", "8"), ("9", "9"), ("×", lambda: self.set_operator('*')),
            ("4", "4"), ("5", "5"), ("6", "6"), ("−", lambda: self.set_operator('-')),
            ("1", "1"), ("2", "2"), ("3", "3"), ("+", lambda: self.set_operator('+')),
            ("0", "0"), (".", "."), ("=", "equals"), 
        ]
        
        row = 0
        col = 0
        for i, (text, func) in enumerate(buttons + main_buttons):
            if text == "=":
                btn = tk.Button(self.button_frame, text=text, font=("Helvetica", 16, "bold"),
                              bg="#00ffcc", fg="#0a0a1f", height=2, width=10,
                              command=lambda f=func: self.calculate())
                btn.grid(row=row, column=col, columnspan=2, padx=3, pady=3, sticky="nsew")
                col += 1
            else:
                color = "#ff6b6b" if text in "C⌫" else \
                       "#4ecdc4" if text in "+−×÷" else \
                       "#45b7d1" if isinstance(func, str) and func.startswith(("sin","cos","tan","sqrt","log","ln")) else "#2c3e50"
                
                btn = tk.Button(self.button_frame, text=text, font=("Helvetica", 14, "bold"),
                              bg=color, fg="white", height=2, width=5,
                              command=self.create_command(func))
                btn.grid(row=row, column=col, padx=3, pady=3, sticky="nsew")
            
            col += 1
            if col > 3:
                col = 0
                row += 1
        
        # Configure grid weights
        for i in range(5):
            self.button_frame.columnconfigure(i, weight=1)
            self.button_frame.rowconfigure(i, weight=1)
    
    def create_command(self, func):
        if isinstance(func, str):
            if func.isdigit() or func == ".":
                return lambda: self.append_digit(func)
            elif func == "clear":
                return self.clear
            elif func == "backspace":
                return self.backspace
            elif func == "percent":
                return self.percent
        return func
    
    def append_digit(self, digit):
        if self.current.get() == "0" and digit != ".":
            self.current.set(digit)
        else:
            self.current.set(self.current.get() + digit)
    
    def set_operator(self, op):
        if self.current.get() != "0":
            self.expression.set(self.current.get() + " " + op)
            self.prev_value = float(self.current.get())
            self.operator = op
            self.current.set("0")
    
    def calculate(self):
        try:
            if not hasattr(self, 'operator'):
                return
                
            current_val = float(self.current.get())
            expr = f"{self.prev_value} {self.operator} {current_val}"
            
            if self.operator == '+':
                result = self.prev_value + current_val
            elif self.operator == '-':
                result = self.prev_value - current_val
            elif self.operator == '*':
                result = self.prev_value * current_val
            elif self.operator == '/':
                if current_val == 0:
                    raise ValueError("Division by zero")
                result = self.prev_value / current_val
            
            self.add_to_history(expr, result)
            self.current.set(str(result))
            self.expression.set("")
            del self.operator
            
        except Exception as e:
            messagebox.showerror("Error", str(e))
            self.clear()
    
    def scientific_func(self, func):
        try:
            num = float(self.current.get())
            result = None
            
            if func == "sin":
                result = math.sin(math.radians(num))
            elif func == "cos":
                result = math.cos(math.radians(num))
            elif func == "tan":
                result = math.tan(math.radians(num))
            elif func == "sqrt":
                result = math.sqrt(num)
            elif func == "square":
                result = num ** 2
            elif func == "log10":
                result = math.log10(num)
            elif func == "ln":
                result = math.log(num)
            elif func == "memory_clear":
                self.memory = 0
                return
            elif func == "memory_recall":
                self.current.set(str(self.memory))
                return
            elif func == "memory_add":
                self.memory += float(self.current.get())
                return
                
            self.current.set(str(round(result, 8)).rstrip('0').rstrip('.'))
        except:
            messagebox.showerror("Error", "Invalid input")
    
    def percent(self):
        try:
            num = float(self.current.get())
            self.current.set(str(num / 100))
        except:
            pass
    
    def clear(self):
        self.current.set("0")
        self.expression.set("")
        if hasattr(self, 'operator'):
            del self.operator
    
    def backspace(self):
        current = self.current.get()
        if len(current) > 1:
            self.current.set(current[:-1])
        else:
            self.current.set("0")
    
    def add_to_history(self, expr, result):
        timestamp = datetime.now().strftime("%H:%M")
        entry = f"[{timestamp}] {expr} = {result}"
        self.history.append(entry)
        if len(self.history) > 20:
            self.history.pop(0)
        
        self.history_text.config(state='normal')
        self.history_text.delete(1.0, tk.END)
        self.history_text.insert(tk.END, "\n".join(self.history[-10:]))
        self.history_text.config(state='disabled')
    
    def toggle_mode(self):
        self.is_scientific = self.mode_var.get()
        self.create_buttons()
    
    def bind_keyboard(self):
        self.root.bind("<Key>", self.key_press)
    
    def key_press(self, event):
        if event.char.isdigit():
            self.append_digit(event.char)
        elif event.char in "+-*/":
            op_map = {"+": "+", "-": "-", "*": "*", "/": "/"}
            self.set_operator(op_map[event.char])
        elif event.char == ".":
            self.append_digit(".")
        elif event.keysym == "Return":
            self.calculate()
        elif event.keysym == "BackSpace":
            self.backspace()
        elif event.keysym == "Escape":
            self.clear()
    
    def run(self):
        self.root.mainloop()


# ==================== RUN THE CALCULATOR ====================
if __name__ == "__main__":
    calculator = PyCalcPro()
    calculator.run()
