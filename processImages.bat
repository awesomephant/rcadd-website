cd assets
cd thumbs
gm mogrify -output-directory ../dist -create-directories -resize 800 *.jpg
gm mogrify -output-directory ../dist -create-directories -resize 800 *.png
cd ..
cd ..