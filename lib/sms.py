#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
from gsmmodem.modem import GsmModem

PORT = '/dev/ttyUSB0'
BAUDRATE = 115200
PIN = 1234 

def handleSms(sms):
    print(u'{0}\t{1}\t{2}\n'.format(sms.number, sms.time, sms.text))
    sys.stdout.flush()
    

def main():
    # os.system("usb_modeswitch -b2 -W -v 12d1 -p 1446 -n --message-content 555342437f0000000002000080000a11062000000000000100000000000000")
    # logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.DEBUG)
    modem = GsmModem(PORT, BAUDRATE, smsReceivedCallbackFunc=handleSms)
    modem.smsTextMode = False
    modem.connect(PIN)

    try:    
        modem.rxThread.join(2**31)
    except:
        print("err")
    finally:
        modem.close();

if __name__ == '__main__':
    main()