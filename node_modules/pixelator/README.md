# Pixelator

Simple, naive node module that will pixelate images with a given scale. Requires imagemagick to be installed. Shells out to `convert` and `identify`.

## Example

    var pixelator = new Pixelator('myimage.jpg');
    pixelator.pixelate({
      scale: 10, // default is 10
      coords: [ [20,20], [40,40] ] // default is entire image
    }, function(readStream) {
        // readStream to myimage.pixelated.jpg
    })

## License

Pixelator is licensed under the MIT License (LICENSE.txt).

Copyright (c) 2013 Brandon Aaron
