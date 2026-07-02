def make_chai():
    if not kettle_has_water():
        fill_kettle()
    plug_in_kettle()
    boil_water()
    if not is_cup_clean():
        wash_cup()
    add_to_cup("tea_leaves")
    add_to_cup("sugar")
    pour("boiled water")
    stir("cup")
    serve("chai")
    
def kettle_has_water():
    return True

def fill_kettle():
    print("Filling the kettle")

def plug_in_kettle():
    print("Plugging in the kettle")

def boil_water():
    print("Boiling water")

def is_cup_clean():
    return True

def wash_cup():
    print("Washing the cup")
    
def add_to_cup(item):
    print(f"Adding {item} to the cup")

def pour(liquid):
    print(f"Pouring {liquid} into the cup")
    
def stir(cup):
    print(f"Stirring the {cup}")
    
def serve(drink):
    print(f"Serving the {drink}")


make_chai()
