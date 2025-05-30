#!/usr/bin/env python3
"""
Create a simple app icon for Visual Learning Platform
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_app_icon():
    # Create a 512x512 image with a gradient background
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create gradient background
    for y in range(size):
        # Blue to purple gradient
        r = int(100 + (y / size) * 55)  # 100 to 155
        g = int(150 + (y / size) * 50)  # 150 to 200
        b = int(255 - (y / size) * 55)  # 255 to 200
        color = (r, g, b, 255)
        draw.line([(0, y), (size, y)], fill=color)
    
    # Draw a book/document icon
    book_width = 300
    book_height = 380
    book_x = (size - book_width) // 2
    book_y = (size - book_height) // 2
    
    # Book shadow
    shadow_offset = 8
    draw.rounded_rectangle(
        [book_x + shadow_offset, book_y + shadow_offset, 
         book_x + book_width + shadow_offset, book_y + book_height + shadow_offset],
        radius=20, fill=(0, 0, 0, 60)
    )
    
    # Book cover
    draw.rounded_rectangle(
        [book_x, book_y, book_x + book_width, book_y + book_height],
        radius=20, fill=(255, 255, 255, 240)
    )
    
    # Book spine
    spine_width = 20
    draw.rounded_rectangle(
        [book_x, book_y, book_x + spine_width, book_y + book_height],
        radius=20, fill=(200, 200, 200, 255)
    )
    
    # Draw pages lines
    for i in range(5):
        y_pos = book_y + 80 + i * 40
        draw.line(
            [book_x + 50, y_pos, book_x + book_width - 30, y_pos],
            fill=(150, 150, 150, 200), width=3
        )
    
    # Draw PDF icon in corner
    pdf_size = 80
    pdf_x = book_x + book_width - pdf_size - 20
    pdf_y = book_y + 20
    
    # PDF background
    draw.rounded_rectangle(
        [pdf_x, pdf_y, pdf_x + pdf_size, pdf_y + pdf_size],
        radius=10, fill=(220, 53, 69, 255)  # Red color
    )
    
    # PDF text
    try:
        # Try to use a system font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
    
    text = "PDF"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = pdf_x + (pdf_size - text_width) // 2
    text_y = pdf_y + (pdf_size - text_height) // 2
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    return img

def main():
    print("Creating app icon...")
    
    # Check if PIL is available
    try:
        icon = create_app_icon()
        
        # Save as PNG first
        icon_path = "Visual Learning Platform.app/Contents/Resources/app-icon.png"
        os.makedirs(os.path.dirname(icon_path), exist_ok=True)
        icon.save(icon_path, "PNG")
        
        # Create different sizes for macOS
        sizes = [16, 32, 64, 128, 256, 512]
        for size in sizes:
            resized = icon.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(f"Visual Learning Platform.app/Contents/Resources/app-icon-{size}.png", "PNG")
        
        print("✅ App icon created successfully!")
        print(f"📁 Icon saved to: {icon_path}")
        
    except ImportError:
        print("⚠️  PIL (Pillow) not available. Creating a simple text-based icon...")
        # Create a simple text file as fallback
        icon_path = "Visual Learning Platform.app/Contents/Resources/app-icon.txt"
        os.makedirs(os.path.dirname(icon_path), exist_ok=True)
        with open(icon_path, 'w') as f:
            f.write("Visual Learning Platform Icon")
        print(f"📁 Simple icon marker created: {icon_path}")

if __name__ == "__main__":
    main()
