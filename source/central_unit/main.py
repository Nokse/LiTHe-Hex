#!/usr/bin/env python3

# Copyright 2016 Noak Ringman, Emil Segerbäck, Robin Sliwa, Frans Skarman, Hannes Tuhkala, Malcolm Wigren, Olav Övrebö

# This file is part of LiTHe Hex.

# LiTHe Hex is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# LiTHe Hex is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with LiTHe Hex.  If not, see <http://www.gnu.org/licenses/>.

import communication.avr_communication as avr_communication
import communication.web as web
import sys
import queue
import time
import decisions.decision_making as decision_making
import decisions.pid_controller as pid_controller
import pdb
import math
import os
import constants
import RPi.GPIO as GPIO

def main():
    
    test_mode = False
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(40, GPIO.IN, GPIO.PUD_DOWN)

    if len(sys.argv) > 0 and sys.argv[0] == "--test":
        test_mode = True

    spi = avr_communication.communication_init()
    res = []

    auto = False
    button_temp = 0

    decision_packet = decision_making.DecisionPacket()

    send_queue = queue.Queue()
    receive_queue = queue.Queue()
    thread = web.CommunicationThread(send_queue, receive_queue)

    thread.start()

    while True:
        #pdb.set_trace()
        button_input = GPIO.input(40)
        if (button_input == 1):
            if (button_temp != button_input):
                auto = not auto
                button_temp = 1
        else:
            button_temp = 0

        if auto:
            # Auto mode
            os.system('clear')
            sensor_data = avr_communication.get_sensor_data(spi)
            print(sensor_data)

            print("button_value: ", button_input)
            print("right_angle: ",sensor_data.right_angle)
            print("left_angle: ",sensor_data.left_angle)
            print("Average angle: ", sensor_data.average_angle)

            decision_making.get_decision(sensor_data, decision_packet)

            print("Decision: ", decision_packet.decision)

            pid_controller.regulate(sensor_data, decision_packet)
            print("Pid controller command: ", decision_packet.regulate_base_movement, ", ", decision_packet.regulate_command_y, ", ", decision_packet.regulate_goal_angle);
            time.sleep(0.1)

            if not receive_queue.empty():
                packet = receive_queue.get()
                if packet.auto is not None:
                    auto = packet.auto 

        else:
            # Manual mode
            os.system('clear')
            print("Entering manual mode!")
            auto = do_manual_mode_iteration(spi, send_queue, receive_queue)
            time.sleep(0.1)


def do_manual_mode_iteration(spi, send_queue, receive_queue):
    sensor_data = avr_communication.get_sensor_data(spi)

    send_queue.put(web.ServerSendPacket(sensor_data))

    auto = False

    if not receive_queue.empty():
        packet = receive_queue.get()
        if packet.auto is not None:
            auto = packet.auto
        if packet.has_motion_command():
            servo_speed = (int)(packet.thrust * constants.MAX_16BIT_SIZE)
            avr_communication.set_servo_speed(spi, servo_speed)

            x_speed = (int)(((packet.x + 1) / 2) * constants.MAX_BYTE_SIZE)
            y_speed = (int)(((packet.y + 1) / 2) * constants.MAX_BYTE_SIZE)
            rotation = (int)(((packet.rotation + 1) / 2)  * constants.MAX_BYTE_SIZE)

            avr_communication.walk(spi, x_speed, y_speed, rotation)
    
    return auto


if __name__ == '__main__':
    main()

