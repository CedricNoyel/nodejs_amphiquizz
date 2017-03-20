#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unicodedata
import logging
import sys
import os
import time
import logging
from gsmmodem.modem import GsmModem

PORT = '/dev/ttyUSB0'
BAUDRATE = 115200
PIN = 1234

def rm_accents(s):
    return unicodedata.normalize('NFKD',s).encode('ascii','ignore')

def handleSms(sms):
    print(u'{0}\t{1}\t{2}\n'.format(sms.number, sms.time, rm_accents(sms.text)))
    sys.stdout.flush()

def main():
    # time.sleep(5)
    # logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.DEBUG)
    modem = GsmModem(PORT, BAUDRATE, smsReceivedCallbackFunc=handleSms)
    modem.smsTextMode = False
    modem.connect(PIN)

    try:    
        modem.rxThread.join(2**31)
    finally:
        modem.close();

if __name__ == '__main__':
    main()