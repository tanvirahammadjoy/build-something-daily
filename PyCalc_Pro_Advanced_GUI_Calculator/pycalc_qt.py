import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QGridLayout, 
                           QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                           QTextEdit, QFrame, QStackedWidget)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont, QPalette, QColor
import math
from datetime import datetime


class PyCalcPro(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyCalc Pro")
        self.setFixedSize(460, 720)
        
        self.memory = 0.0
        self.history = []
        self.prev_value = 0.0
        self.operator = None
        self.is_scientific = True
        
        self.setup_ui()
        
    def setup_ui(self):
        # Central Widget
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)
        main_layout.setSpacing(15)
        main_layout.setContentsMargins(15, 15, 15, 15)
        
        # Title
        title = QLabel("PyCalc Pro")
        title.setFont(QFont("Segoe UI", 28, QFont.Weight.Bold))
        title.setStyleSheet("color: #00ffcc;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title)
        
        # Display
        display_frame = QFrame()
        display_frame.setStyleSheet("""
            QFrame {
                background: #0f1629;
                border-radius: 15px;
                border: 2px solid #00ffcc;
            }
        """)
        display_layout = QVBoxLayout(display_frame)
        
        self.expr_label = QLabel("")
        self.expr_label.setFont(QFont("Consolas", 14))
        self.expr_label.setStyleSheet("color: #00ffaa;")
        self.expr_label.setAlignment(Qt.AlignmentFlag.AlignRight)
        
        self.display_label = QLabel("0")
        self.display_label.setFont(QFont("Consolas", 42, QFont.Weight.Bold))
        self.display_label.setStyleSheet("color: white;")
        self.display_label.setAlignment(Qt.AlignmentFlag.AlignRight)
        
        display_layout.addWidget(self.expr_label)
        display_layout.addWidget(self.display_label)
        main_layout.addWidget(display_frame)
        
        # History
        history_label = QLabel("History")
        history_label.setStyleSheet("color: #888;")
        main_layout.addWidget(history_label)
        
        self.history_box = QTextEdit()
        self.history_box.setFixedHeight(120)
        self.history_box.setReadOnly(True)
        self.history_box.setStyleSheet("""
            QTextEdit {
                background: #1a2338;
                color: #bbbbbb;
                border-radius: 10px;
                font-family: Consolas;
            }
        """)
        main_layout.addWidget(self.history_box)
        
        # Mode Switch
        mode_layout = QHBoxLayout()
        self.basic_btn = QPushButton("Basic")
        self.sci_btn = QPushButton("Scientific")
        
        for btn in [self.basic_btn, self.sci_btn]:
            btn.setCheckable(True)
            btn.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        
        self.sci_btn.setChecked(True)
        self.basic_btn.clicked.connect(lambda: self.set_mode(False))
        self.sci_btn.clicked.connect(lambda: self.set_mode(True))
        
        mode_layout.addWidget(self.basic_btn)
        mode_layout.addWidget(self.sci_btn)
        main_layout.addLayout(mode_layout)
        
        # Buttons Grid
        self.grid = QGridLayout()
        self.grid.setSpacing(8)
        main_layout.addLayout(self.grid)
        
        self.create_buttons()
        
        # Set dark theme
        self.setStyleSheet("""
            QMainWindow {
                background: #0c1320;
            }
            QPushButton {
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                padding: 12px;
            }
        """)
    
    def create_buttons(self):
        # Clear previous buttons
        for i in reversed(range(self.grid.count())):
            self.grid.itemAt(i).widget().setParent(None)
        
        buttons = []
        
        if self.is_scientific:
            sci_buttons = [
                ("MC", self.memory_clear), ("MR", self.memory_recall), ("M+", self.memory_add),
                ("sin", self.sin), ("cos", self.cos), ("tan", self.tan),
                ("√x", self.sqrt), ("x²", self.square), ("log", self.log10), ("ln", self.ln)
            ]
            for text, func in sci_buttons:
                btn = QPushButton(text)
                btn.setStyleSheet("background: #1e3a5f; color: #7dd3fc;")
                btn.clicked.connect(func)
                buttons.append(btn)
        
        # Standard buttons
        standard = [
            ("C", self.clear_all, "#e74c3c"), ("⌫", self.backspace, "#e74c3c"),
            ("%", self.percent, "#f39c12"), ("÷", lambda: self.set_op('/'), "#00b894"),
            
            ("7", lambda: self.add_digit('7'), "#2c3e50"), ("8", lambda: self.add_digit('8'), "#2c3e50"),
            ("9", lambda: self.add_digit('9'), "#2c3e50"), ("×", lambda: self.set_op('*'), "#00b894"),
            
            ("4", lambda: self.add_digit('4'), "#2c3e50"), ("5", lambda: self.add_digit('5'), "#2c3e50"),
            ("6", lambda: self.add_digit('6'), "#2c3e50"), ("−", lambda: self.set_op('-'), "#00b894"),
            
            ("1", lambda: self.add_digit('1'), "#2c3e50"), ("2", lambda: self.add_digit('2'), "#2c3e50"),
            ("3", lambda: self.add_digit('3'), "#2c3e50"), ("+", lambda: self.set_op('+'), "#00b894"),
            
            ("0", lambda: self.add_digit('0'), "#2c3e50"), (".", lambda: self.add_digit('.'), "#2c3e50"),
            ("=", self.equals, "#00ffcc")
        ]
        
        row, col = 0, 0
        for item in buttons + standard:
            if isinstance(item, QPushButton):
                btn = item
            else:
                text, func, *color = item
                btn = QPushButton(text)
                if color:
                    btn.setStyleSheet(f"background: {color[0]}; color: {'#0f1629' if color[0] == '#00ffcc' else 'white'};")
                btn.clicked.connect(func)
            
            if text == "=":
                btn.setMinimumHeight(70)
                self.grid.addWidget(btn, row, col, 1, 2)
                col += 1
            else:
                self.grid.addWidget(btn, row, col)
            
            col += 1
            if col > 3:
                col = 0
                row += 1
    
    def add_digit(self, digit):
        current = self.display_label.text()
        if current == "0" and digit != ".":
            self.display_label.setText(digit)
        elif digit == "." and "." in current:
            return
        else:
            self.display_label.setText(current + digit)
    
    def set_op(self, op):
        self.prev_value = float(self.display_label.text())
        self.operator = op
        self.expr_label.setText(f"{self.prev_value} {op}")
        self.display_label.setText("0")
    
    def equals(self):
        if not self.operator:
            return
        
        try:
            current = float(self.display_label.text())
            expr = f"{self.prev_value} {self.operator} {current}"
            
            if self.operator == '+': result = self.prev_value + current
            elif self.operator == '-': result = self.prev_value - current
            elif self.operator == '*': result = self.prev_value * current
            elif self.operator == '/':
                if current == 0: raise ValueError("Cannot divide by zero")
                result = self.prev_value / current
            
            self.add_history(expr, result)
            self.display_label.setText(str(round(result, 8)).rstrip('0').rstrip('.'))
            self.expr_label.setText("")
            self.operator = None
        except Exception as e:
            self.display_label.setText("Error")
    
    def scientific_func(self, func_name):
        try:
            num = float(self.display_label.text())
            result = None
            
            if func_name == "sin": result = math.sin(math.radians(num))
            elif func_name == "cos": result = math.cos(math.radians(num))
            elif func_name == "tan": result = math.tan(math.radians(num))
            elif func_name == "sqrt": result = math.sqrt(num)
            elif func_name == "square": result = num ** 2
            elif func_name == "log10": result = math.log10(num)
            elif func_name == "ln": result = math.log(num)
            
            self.display_label.setText(str(round(result, 8)).rstrip('0').rstrip('.'))
        except:
            self.display_label.setText("Error")
    
    # Scientific functions wrappers
    def sin(self): self.scientific_func("sin")
    def cos(self): self.scientific_func("cos")
    def tan(self): self.scientific_func("tan")
    def sqrt(self): self.scientific_func("sqrt")
    def square(self): self.scientific_func("square")
    def log10(self): self.scientific_func("log10")
    def ln(self): self.scientific_func("ln")
    
    def memory_clear(self): self.memory = 0
    def memory_recall(self): self.display_label.setText(str(self.memory))
    def memory_add(self): self.memory += float(self.display_label.text())
    
    def percent(self):
        try:
            num = float(self.display_label.text())
            self.display_label.setText(str(num / 100))
        except: pass
    
    def clear_all(self):
        self.display_label.setText("0")
        self.expr_label.setText("")
        self.operator = None
    
    def backspace(self):
        current = self.display_label.text()
        if len(current) > 1:
            self.display_label.setText(current[:-1])
        else:
            self.display_label.setText("0")
    
    def add_history(self, expr, result):
        timestamp = datetime.now().strftime("%H:%M")
        entry = f"[{timestamp}] {expr} = {result}\n"
        self.history.append(entry)
        if len(self.history) > 15:
            self.history.pop(0)
        
        self.history_box.setPlainText("".join(self.history))
        self.history_box.verticalScrollBar().setValue(self.history_box.verticalScrollBar().maximum())
    
    def set_mode(self, scientific):
        self.is_scientific = scientific
        self.sci_btn.setChecked(scientific)
        self.basic_btn.setChecked(not scientific)
        self.create_buttons()
    
    # Keyboard Support
    def keyPressEvent(self, event):
        key = event.text()
        if key.isdigit() or key == ".":
            self.add_digit(key)
        elif key in "+-*/":
            self.set_op(key if key != '*' else '*')
        elif event.key() == Qt.Key.Key_Return or event.key() == Qt.Key.Key_Enter:
            self.equals()
        elif event.key() == Qt.Key.Key_Backspace:
            self.backspace()
        elif event.key() == Qt.Key.Key_Escape:
            self.clear_all()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PyCalcPro()
    window.show()
    sys.exit(app.exec())