Dayun Design Studio: AI Origami Generator & Image Editor
An AI-powered design studio specializing in origami generation and advanced image editing. Describe any origami concept and watch it come to life, or upload your own images to access a powerful suite of AI-driven editing tools. Built with React and the Google Gemini API.
![alt text](https://storage.googleapis.com/maker-suite-gallery/images/project-samples/dayun_design_studio_screenshot.png)
<!-- Replace with your own screenshot -->
✨ Features
The application is split into two main modes: a start screen for image generation/selection and a powerful single-image editor.
🎨 Creative Suite
Text-to-Image Generation: Create beautiful, high-quality images of origami concepts from a simple text prompt.
Prompt Builder: An interactive assistant on the start screen helps you craft the perfect prompt by selecting from categories like Origami Type, Shape, Color, Style, and more.
Prompt History: Your recent text-to-image prompts are saved locally for easy reuse.
Image Variations: Generate multiple creative variations from a single image or prompt.
Generate Animation: Create a short, looping 360-degree rotation animation (MP4 video) from your image.
🛠️ AI-Powered Editing Suite
AI Suggestions: The editor analyzes your uploaded image and provides one-click enhancement suggestions.
Magic Edit: Perform precise, localized edits. Simply click a point on the image and describe the change (e.g., "change the color to blue").
Lasso Select: Draw a free-form selection around an area and describe the changes you want to make only within that region.
Style Transfer: Apply the complete artistic style (colors, textures, mood) of one image onto another.
Remove Background: Automatically identifies the main subject and removes the background, creating a transparent PNG.
Generative Expand (Outpainting): Expand the canvas of your image and let AI seamlessly fill in the new areas, with optional text prompts for context.
AI Upscale: Increase the image resolution by 2x while intelligently enhancing details and sharpness.
Presets: Save a sequence of edits as a custom preset and apply your entire workflow to other images with a single click.
📷 Standard Editing Tools
Adjustments: Apply professional adjustments like blurring the background, enhancing details, applying warmer lighting, or completely replacing the background with a new scene described by a prompt.
Filters: A wide range of one-click artistic filters (Synthwave, Anime, Noir, etc.) and the ability to describe your own custom filter.
Crop: Standard image cropping with aspect ratio presets (Square, 16:9).
Undo/Redo/Reset: Full history control over your editing session.
Comparison Slider: A draggable slider to compare your current edit with the original image in real-time.
🌐 Other Features
Batch Editor: Apply a single filter or adjustment to multiple images at once and download them as a .zip file.
Multi-language Support: The user interface can be translated into multiple languages on the fly.
Fully Responsive: A seamless experience on both desktop and mobile devices.
⌨️ Keyboard Shortcuts
To improve accessibility and speed up your workflow, the following shortcuts are available:
Start Screen
Action	Shortcut
Focus Prompt Input	Alt + P
Generate Image	Alt + G
Upload an Image	Alt + U
Select (Batch Edit)	Alt + B
Image Editor
Action	Windows/Linux Shortcut	macOS Shortcut
Undo	Ctrl + Z	Cmd + Z
Redo	Ctrl + Y / Ctrl+Shift+Z	Cmd + Shift + Z
Reset Image	Ctrl + R	Cmd + R
Download Image	Ctrl + D	Cmd + D
Exit Editor	Esc	Esc
Switch Editor Tabs	Alt + [1-9]	Alt + [1-9]
⚙️ System Requirements
Software Requirements
A modern web browser (e.g., Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
A stable internet connection is required to communicate with the Google Gemini API.
Hardware Requirements
Any modern computer (desktop, laptop, tablet) capable of running a web browser.
No special hardware (like a dedicated GPU) is needed, as all AI processing is performed in the cloud.
🚀 Running Locally (Installation)
Follow these steps to run the Dayun Design Studio on your local machine.
Clone the Repository
code
Bash

download

content_copy

expand_less
git clone https://github.com/your-username/dayun-design-studio.git
cd dayun-design-studio
Set Up Your API Key
This application requires a Google Gemini API key. You must make this key available as process.env.API_KEY in the execution context. How you do this depends on your local development setup, but a common method is to use a tool like Vite which can load variables from a .env file.
Serve the Application
This is a static web application. You can serve the index.html file using any local web server. Here are a few simple options:
Using the Live Server extension for VS Code. (Recommended for ease of use)
Using Python's built-in server:
code
Bash

download

content_copy

expand_less
# In the project's root directory
# For Python 3
python3 -m http.server
Using Node.js and the serve package:
code
Bash

download

content_copy

expand_less
# You may need to install serve first: npm install -g serve
npx serve .
Open in Your Browser
Navigate to the local address provided by your server (e.g., http://localhost:8000, http://127.0.0.1:5500, etc.).
