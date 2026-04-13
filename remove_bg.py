from PIL import Image

def flood_fill_transparent(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    pixels = img.load()
    
    # We'll use a set for visited pixels to avoid infinite loops
    visited = set()
    
    # Target color we want to replace (from the corners)
    target_colors = [pixels[0, 0], pixels[width-1, 0], pixels[0, height-1], pixels[width-1, height-1]]
    
    # Function to check if a color is similar to the target color
    def is_similar(c1, c2, tol):
        return (abs(c1[0] - c2[0]) < tol and
                abs(c1[1] - c2[1]) < tol and
                abs(c1[2] - c2[2]) < tol)
    
    # Perform bread-first search flood fill
    # Start queues from all 4 corners
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    while queue:
        x, y = queue.pop(0)
        
        if (x, y) in visited:
            continue
            
        visited.add((x, y))
        
        current_pixel = pixels[x, y]
        
        # Check against any of the corner colors
        match = False
        for tc in target_colors:
            if is_similar(current_pixel, tc, tolerance):
                match = True
                break
                
        if match:
            # Make it transparent
            pixels[x, y] = (255, 255, 255, 0)
            
            # Add neighbors
            if x > 0: queue.append((x-1, y))
            if x < width-1: queue.append((x+1, y))
            if y > 0: queue.append((x, y-1))
            if y < height-1: queue.append((x, y+1))

    img.save(output_path, "PNG")

flood_fill_transparent("public/assets/images/logo.jpeg", "public/assets/images/logo.png", tolerance=50)
print("Saved transparent image via flood fill")
