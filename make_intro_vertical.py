import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import sys

# Config
WIDTH, HEIGHT = 1080, 1920 # 9:16 aspect ratio (portrait) for mobile Reels/TikTok
SCALE = 2 # Render at 2160x3840, scale down to 1080x1920
W_RENDER, H_RENDER = WIDTH * SCALE, HEIGHT * SCALE
FPS = 30
DURATION = 5 # seconds
TOTAL_FRAMES = FPS * DURATION # 150 frames

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
    def get_q_points(p0, p1, p2, num_steps=30):
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
    output_path = "growth_beacon_intro_vertical.mp4"
    print("Initializing vertical video writer...")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(output_path, fourcc, FPS, (WIDTH, HEIGHT))
    
    # Branding coordinates on Render canvas (2160x3840)
    X_CENTER = W_RENDER // 2
    Y_BASE = 2000
    
    BAR_W = 120
    BAR_GAP = 40
    
    # Final heights on Render canvas
    H1, H2, H3 = 240, 480, 720
    
    # Final positions
    X1 = X_CENTER - 200 - BAR_W // 2
    X2 = X_CENTER - BAR_W // 2
    X3 = X_CENTER + 200 - BAR_W // 2
    
    # Sparkle positions
    SPARKLE_CX = X3 + BAR_W // 2
    SPARKLE_CY = Y_BASE - H3 - 120
    SPARKLE_R = 90
    
    bg_color = (7, 11, 25) # Brand bg-dark (#070B19)
    
    print(f"Generating {TOTAL_FRAMES} frames...")
    for frame_idx in range(TOTAL_FRAMES):
        if frame_idx % 15 == 0:
            print(f"Frame {frame_idx}/{TOTAL_FRAMES} ({int(frame_idx/TOTAL_FRAMES*100)}%)")
            
        t = frame_idx / TOTAL_FRAMES
        frame_img = Image.new("RGB", (W_RENDER, H_RENDER), bg_color)
        draw = ImageDraw.Draw(frame_img)
        
        # 1. SPARKLE FIRST (Fades in from frame 0 to 30)
        sparkle_pct = min(1.0, frame_idx / 30)
        sparkle_ease = ease_out_quad(sparkle_pct)
        cur_r = SPARKLE_R * sparkle_ease
        
        if cur_r > 1:
            # Draw soft radial glow
            glow_radial = Image.new("L", (W_RENDER, H_RENDER), 0)
            gr_draw = ImageDraw.Draw(glow_radial)
            gr_draw.circle((SPARKLE_CX, SPARKLE_CY), int(cur_r * 3.0), fill=int(50 * sparkle_ease))
            glow_color_layer = Image.new("RGB", (W_RENDER, H_RENDER), (242, 201, 76))
            frame_img.paste(glow_color_layer, (0, 0), glow_radial)
            
            # Draw Sparkle Star
            draw_sparkle(draw, SPARKLE_CX, SPARKLE_CY, cur_r, (242, 201, 76))
            
            # Central white core
            draw.circle((SPARKLE_CX, SPARKLE_CY), int(12 * sparkle_ease), fill=(255, 255, 255))
            
        # 2. RISING GRAPH (Starts at frame 35 sequentially)
        if frame_idx >= 35:
            pct1 = min(1.0, max(0.0, (frame_idx - 35) / 40))
            cur_h1 = H1 * ease_in_out_quad(pct1)
            
            pct2 = min(1.0, max(0.0, (frame_idx - 47) / 40))
            cur_h2 = H2 * ease_in_out_quad(pct2)
            
            pct3 = min(1.0, max(0.0, (frame_idx - 59) / 40))
            cur_h3 = H3 * ease_in_out_quad(pct3)
            
            # Draw Bar 1
            if cur_h1 > 10:
                draw_gradient_round_rect(frame_img, X1, Y_BASE - cur_h1, BAR_W, cur_h1, 24, (15, 32, 39), (32, 58, 67))
            # Draw Bar 2
            if cur_h2 > 10:
                draw_gradient_round_rect(frame_img, X2, Y_BASE - cur_h2, BAR_W, cur_h2, 24, (0, 82, 212), (67, 100, 247))
            # Draw Bar 3
            if cur_h3 > 10:
                draw_gradient_round_rect(frame_img, X3, Y_BASE - cur_h3, BAR_W, cur_h3, 24, (0, 114, 255), (0, 240, 255))
                
        # 3. TYPOGRAPHY (Starts fading in at 90, positioned below logo)
        if frame_idx >= 90:
            text_pct = min(1.0, (frame_idx - 90) / 40)
            text_ease = ease_out_quad(text_pct)
            
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
            )
            
            title_font = get_font(bold=True, size=104)
            sub_font = get_font(bold=False, size=36)
            
            # Calculate word widths
            w_growth = draw.textlength("GROWTH ", font=title_font)
            w_beacon = draw.textlength("BEACON", font=title_font)
            total_title_w = w_growth + w_beacon
            
            ty = 2400 - 30 * (1 - text_ease)
            tx_start = X_CENTER - total_title_w // 2
            
            # Draw split name
            draw.text((tx_start, ty), "GROWTH ", font=title_font, fill=title_color_white)
            draw.text((tx_start + w_growth, ty), "BEACON", font=title_font, fill=title_color_cyan)
            
            # Draw subtitle text
            sub_text = "DIGITAL MARKETING AGENCY"
            char_spacing = 12
            
            total_sub_w = 0
            for char in sub_text:
                total_sub_w += draw.textlength(char, font=sub_font) + char_spacing
            total_sub_w -= char_spacing
            
            sy = 2560 - 20 * (1 - text_ease)
            curr_x = X_CENTER - total_sub_w // 2
            for char in sub_text:
                draw.text((curr_x, sy), char, font=sub_font, fill=sub_color)
                curr_x += draw.textlength(char, font=sub_font) + char_spacing
                
        # Resize to vertical 1080p
        final_frame = frame_img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.ANTIALIAS)
        
        # Convert PIL RGB to OpenCV BGR
        open_cv_frame = cv2.cvtColor(np.array(final_frame), cv2.COLOR_RGB2BGR)
        video.write(open_cv_frame)
        
    video.release()
    print(f"Vertical video saved successfully at {output_path}!")

if __name__ == "__main__":
    main()
