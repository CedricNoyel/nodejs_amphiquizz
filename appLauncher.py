
import os

def main():
    os.system("sudo usb_modeswitch -b2 -W -v 12d1 -p 1446 -n --message-content 555342437f0000000002000080000a11062000000000000100000000000000")
    os.system("sudo nodemon ~/dev/nodejs/nodejs_amphiquizz/app.js")

if __name__ == '__main__':
    main()

