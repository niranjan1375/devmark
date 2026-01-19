#!/bin/bash
# This script converts the SVG icon to PNG formats
# Requires: imagemagick or inkscape

if command -v convert &> /dev/null; then
    convert icon.svg -resize 16x16 icon16.png
    convert icon.svg -resize 48x48 icon48.png
    convert icon.svg -resize 128x128 icon128.png
    echo "Icons created with ImageMagick"
elif command -v inkscape &> /dev/null; then
    inkscape icon.svg --export-filename=icon16.png -w 16 -h 16
    inkscape icon.svg --export-filename=icon48.png -w 48 -h 48
    inkscape icon.svg --export-filename=icon128.png -w 128 -h 128
    echo "Icons created with Inkscape"
else
    echo "Please install ImageMagick or Inkscape to generate PNG icons"
    echo "Or use an online SVG to PNG converter with these sizes: 16x16, 48x48, 128x128"
fi
