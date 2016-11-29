import unittest
import communication
import comm_gui.web as web
import json
import math

SENSOR_ARGS = (1, 2, 3, 4, 5, 0x01, 0xFE)
CORRIDOR_ARGS = (0x01, 0xFE, 1, 2, 3, 4, 180)
DEBUG_STRING_NORMAL = "hello"
AUTO_NORMAL = False

EXPECTED_NORMAL = {
    "ir_down" : 0.01,
    "ir_fl" : 0.02,
    "ir_bl" : 0.03,
    "ir_fr" : 0.04,
    "ir_br" : 0.05,
    "lidar" : 510,
    "dist_f" : 510,
    "dist_d" : 0.01,
    "dist_l" : 0.02,
    "dist_r" : 0.03,
    "corr_angle" : math.pi,
    "auto" : AUTO_NORMAL,
    "debug" : DEBUG_STRING_NORMAL
}

class WebTestCase(unittest.TestCase):

    def test_send_packet_normal_json(self):
        sensor_data_packet = web.SensorDataPacket(*SENSOR_ARGS)
        corridor_packet = web.CorridorDataPacket(*CORRIDOR_ARGS)
        send_packet = web.ServerSendPacket(
            sensor_data_packet,
            corridor_packet,
            AUTO_NORMAL,
            DEBUG_STRING_NORMAL)
        json_string = send_packet.get_json()
        self.assertDictEqual(EXPECTED_NORMAL, json.loads(json_string))


    def test_thread_close(self):
        pass


class CommunicationTestCase(unittest.TestCase):
    
    def test_sensor_data_packet(self):
        pass

    def test_corridor_data_packet(self):
        pass

    def test_add_parity(self):
        pass


