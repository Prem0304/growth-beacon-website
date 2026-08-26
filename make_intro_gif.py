import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Config
WIDTH, HEIGHT = 960, 540 # Half HD for efficient GIF size and loading speed
SCALE = 2 # Render at 1920x1080, scale down to 960x540 for anti-aliasing
W_RENDER, H_RENDER = WIDTH * SCALE, HEIGHT * SCALE
FPS = 25 # 25 FPS
DURATION = 5 # seconds
TOTAL_FRAMES = FPS * DURATION # 125 frames

# Find fonts
def get_font(bold=False, size=24):
    font_dir = "C:\\Windows\\Fonts"
    font_name = "segoeuib.ttf" if bold else "segoeui.ttf"
    font_path = os.path.join(font_dir, font_name)
    if not os.path.exists(font_path):
        font_path = os.path.join(font_dir, "arialbd.ttf" if bold else "arial.ttf")
    if not os.path.exists(font_path):
        return ImageFont.load_default()
    return ImageFont.truetype(font_path, size)

# Math Easing Functions
def ease_out_quad(t):
    return 1 - (1 - t) * (1 - t)

def ease_in_out_quad(t):
    return 2 * t * t if t < 0.5 else 1 - ((-2 * t + 2) ** 2) / 2

# Draw 4-point sparkle star using quadratic bezier curves
def draw_sparkle(draw, cx, cy, r, fill_color):
    def get_q_points(p0, p1, p2, num_steps=20):
        seg_pts = []
        for i in range(num_steps + 1):
            t = i / num_steps
            x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
            y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
            seg_pts.append((x, y))
        return seg_pts
    
    top = (cx, cy - r)
    right = (cx + r, cy)
    bottom = (cx, cy + r)
    left = (cx - r, cy)
    center = (cx, cy)
    
    pts = []
    pts.extend(get_q_points(top, center, right))
    pts.extend(get_q_points(right, center, bottom))
    pts.extend(get_q_points(bottom, center, left))
    pts.extend(get_q_points(left, center, top))
    
    draw.polygon(pts, fill=fill_color)

# Draw rounded rect with vertical gradient
def draw_gradient_round_rect(image, x, y, w, h, rx, color_start, color_end):
    # Mask image
    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([x, y, x+w, y+h], radius=rx, fill=255)
    
    # Gradient image
    grad = Image.new("RGB", image.size)
    grad_draw = ImageDraw.Draw(grad)
    for i in range(int(y), int(y+h)):
        pct = (i - y) / h
        r = int(color_start[0] * (1 - pct) + color_end[0] * pct)
        g = int(color_start[1] * (1 - pct) + color_end[1] * pct)
        b = int(color_start[2] * (1 - pct) + color_end[2] * pct)
        grad_draw.line([(0, i), (image.width, i)], fill=(r, g, b))
        
    image.paste(grad, (0, 0), mask)

def main():
    output_path = "growth_beacon_intro.gif"
    print("Generating frames with storytelling timeline...")
    
    # Branding coordinates on Render canvas (1920x1080)
    X_CENTER = W_RENDER // 2
    Y_BASE = 780
    
    BAR_W = 60
    BAR_GAP = 20
    
    # Final heights on Render canvas
    H1, H2, H3 = 120, 240, 360
    
    # Final positions
    X1 = X_CENTER - 100 - BAR_W // 2
    X2 = X_CENTER - BAR_W // 2
    X3 = X_CENTER + 100 - BAR_W // 2
    
    # Sparkle positions
    SPARKLE_CX = X3 + BAR_W // 2
    SPARKLE_CY = Y_BASE - H3 - 60
    SPARKLE_R = 45
    
    frames_list = []
    
    # Pre-calculate background color
    bg_color = (7, 11, 25) # Brand bg-dark (#070B19)
    
    for frame_idx in range(TOTAL_FRAMES):
        if frame_idx % 15 == 0:
            print(f"Render Frame {frame_idx}/{TOTAL_FRAMES} ({int(frame_idx/TOTAL_FRAMES*100)}%)")
            
        frame_img = Image.new("RGB", (W_RENDER, H_RENDER), bg_color)
        draw = ImageDraw.Draw(frame_img)
        
        # 1. BEACON LIGHT FIRST (Fades in from frame 0 to 25, active throughout)
        # Sparkle animation progress
        sparkle_pct = min(1.0, frame_idx / 25)
        sparkle_ease = ease_out_quad(sparkle_pct)
        cur_r = SPARKLE_R * sparkle_ease
        
        if cur_r > 1:
            # Draw soft radial glow around sparkle
            beam_color_layer = Image.new("RGB", (W_RENDER, H_RENDER), (242, 201, 76)) # Brand Gold (#F2C94C)
            glow_radial = Image.new("L", (W_RENDER, H_RENDER), 0)
            gr_draw = ImageDraw.Draw(glow_radial)
            gr_draw.circle((SPARKLE_CX, SPARKLE_CY), int(cur_r * 3.0), fill=int(50 * sparkle_ease))
            frame_img.paste(beam_color_layer, (0, 0), glow_radial)
            
            # Draw the Sparkle Star
            draw_sparkle(draw, SPARKLE_CX, SPARKLE_CY, cur_r, (242, 201, 76))
            
            # Central white core
            draw.circle((SPARKLE_CX, SPARKLE_CY), int(6 * sparkle_ease), fill=(255, 255, 255))
            
        # 2. RISING GRAPH (Starts at frame 30 sequentially - guided by the beacon light)
        if frame_idx >= 30:
            # Bar 1 (Left): starts rising at frame 30, ends at 65
            pct1 = min(1.0, max(0.0, (frame_idx - 30) / 35))
            cur_h1 = H1 * ease_in_out_quad(pct1)
            
            # Bar 2 (Middle): starts rising at frame 40, ends at 75
            pct2 = min(1.0, max(0.0, (frame_idx - 40) / 35))
            cur_h2 = H2 * ease_in_out_quad(pct2)
            
            # Bar 3 (Right): starts rising at frame 50, ends at 85
            pct3 = min(1.0, max(0.0, (frame_idx - 50) / 35))
            cur_h3 = H3 * ease_in_out_quad(pct3)
            
            # Draw Bar 1
            if cur_h1 > 5:
                draw_gradient_round_rect(frame_img, X1, Y_BASE - cur_h1, BAR_W, cur_h1, 12, (15, 32, 39), (32, 58, 67))
            # Draw Bar 2
            if cur_h2 > 5:
                draw_gradient_round_rect(frame_img, X2, Y_BASE - cur_h2, BAR_W, cur_h2, 12, (0, 82, 212), (67, 100, 247))
            # Draw Bar 3
            if cur_h3 > 5:
                draw_gradient_round_rect(frame_img, X3, Y_BASE - cur_h3, BAR_W, cur_h3, 12, (0, 114, 255), (0, 240, 255))
                
        # 3. TYPOGRAPHY (Starts fading in at frame 75, matching website style)
        if frame_idx >= 75:
            text_pct = min(1.0, (frame_idx - 75) / 35)
            text_ease = ease_out_quad(text_pct)
            
            # Title color: Blend from background color to solid white/cyan
            white_r = int(255 * text_ease + bg_color[0] * (1 - text_ease))
            white_g = int(255 * text_ease + bg_color[1] * (1 - text_ease))
            white_b = int(255 * text_ease + bg_color[2] * (1 - text_ease))
            title_color_white = (white_r, white_g, white_b)
            
            cyan_r = int(0 * text_ease + bg_color[0] * (1 - text_ease))
            cyan_g = int(240 * text_ease + bg_color[1] * (1 - text_ease))
            cyan_b = int(255 * text_ease + bg_color[2] * (1 - text_ease))
            title_color_cyan = (cyan_r, cyan_g, cyan_b)
            
            sub_color = (
                int(148 * text_ease + bg_color[0] * (1 - text_ease)),
                int(163 * text_ease + bg_color[1] * (1 - text_ease)),
                int(184 * text_ease + bg_color[2] * (1 - text_ease))
            ) # Slate-muted (#94A3B8)
            
            # Setup fonts
            title_font = get_font(bold=True, size=58)
            sub_font = get_font(bold=False, size=18)
            
            # Calculate word widths for "GROWTH BEACON" to display split color on same line
            w_growth = draw.textlength("GROWTH ", font=title_font)
            w_beacon = draw.textlength("BEACON", font=title_font)
            total_title_w = w_growth + w_beacon
            
            ty = 900 - 12 * (1 - text_ease)
            tx_start = X_CENTER - total_title_w // 2
            
            # Draw GROWTH in White
            draw.text((tx_start, ty), "GROWTH ", font=title_font, fill=title_color_white)
            # Draw BEACON in Cyan
            draw.text((tx_start + w_growth, ty), "BEACON", font=title_font, fill=title_color_cyan)
            
            # Render subtitle text (DIGITAL MARKETING AGENCY)
            sub_text = "DIGITAL MARKETING AGENCY"
            char_spacing = 8
            
            total_sub_w = 0
            for char in sub_text:
                total_sub_w += draw.textlength(char, font=sub_font) + char_spacing
            total_sub_w -= char_spacing
            
            sy = 970 - 7 * (1 - text_ease)
            curr_x = X_CENTER - total_sub_w // 2
            for char in sub_text:
                draw.text((curr_x, sy), char, font=sub_font, fill=sub_color)
                curr_x += draw.textlength(char, font=sub_font) + char_spacing
                
        # Resize to GIF size (960x540)
        final_frame = frame_img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.ANTIALIAS)
        frames_list.append(final_frame)
        
    print("Compiling frames into animated GIF...")
    # Save animated GIF
    frames_list[0].save(
        output_path,
        save_all=True,
        append_images=frames_list[1:],
        duration=40, # 40ms = 25 FPS
        loop=0,
        optimize=True
    )
    print(f"GIF compiled successfully at {output_path}!")

if __name__ == "__main__":
    main()
