import sensor, image, time

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)

red_threshold = (16, 100, 39, 127, 22, 127)
#old green (62, 100, -26, 127, 6, 127)
green_threshold = (83, 100, -33, -17, 9, 23)
blue_threshold = (77, 100, -41, -2, -27, 1)
white_threshold = (91, 100, -7, 5, -37, 4)

def init():
    img = sensor.snapshot()
    blobRed = img.find_blobs([red_threshold], pixels_threshold=200, area_threshold=200)
    blobGreen = img.find_blobs([green_threshold], pixels_threshold=200, area_threshold=200)
    blobBlue = img.find_blobs([blue_threshold], pixels_threshold=200, area_threshold=200)
    walls = img.find_blobs([white_threshold], pixels_threshold=200, area_threshold=200)

    if blobRed:
        largest_blob = max(blobRed, key=lambda b: b.pixels())
        x, y = largest_blob.cx(), largest_blob.cy()
        img.draw_cross(x, y, color=(0, 255, 0))
        print(f"Ball position: x={x}, y={y}")
#        return ball x, y  necessary in order for spike to get data

    if blobGreen:
        largest_blob = max(blobGreen, key=lambda b: b.pixels())
        x, y = largest_blob.cx(), largest_blob.cy()
        img.draw_cross(x, y, color=(255, 0, 0))
        print(f"Start position: x={x}, y={y}")
#        return start x, y

    if blobBlue:
        largest_blob = max(blobBlue, key=lambda b: b.pixels())
        x, y = largest_blob.cx(), largest_blob.cy()
        img.draw_cross(x, y, color=(255, 165, 0))
        print(f"End position: x={x}, y={y}")
        # return end x, y

    if walls:
        wall_string = ""
        count = 1
        for i in walls:
            x, y = i.cx(), i.cy()
            wall_string += "Wall #" + str(count) + ": x = "+ str(x) + " y = " + str(y) + "\n"
            img.draw_cross(x, y, color=(0, 0, 0))
            count += 1
        print(wall_string)
        #return array of wall pos

    time.sleep_ms(100)

while(True):
    init()
