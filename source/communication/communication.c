// Copyright 2016 Noak Ringman, Emil Segerb�ck, Robin Sliwa, Frans Skarman, Hannes Tuhkala, Malcolm Wigren, Olav �vreb�

// This file is part of LiTHe Hex.

// LiTHe Hex is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// LiTHe Hex is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with LiTHe Hex.  If not, see <http://www.gnu.org/licenses/>.

#include <stdbool.h>

#include "communication.h"

bool check_parity();

void send_reply_sensor(uint8_t current_msg);

void send_reply_motor(uint8_t current_msg);

uint8_t get_id(Frame* frame_recv);

void get_new_frame(Frame* frame_recv);

void send_reply_test();

void on_spi_recv(Frame* frame_recv) {

	get_new_frame(frame_recv);

	bool success = check_parity(frame_recv);
	if(success) { // continue if message ok
		spi_transmit_ack();
	} else { // Something was wrong with message
		spi_transmit_fail();
	}
}

void send_reply_test() {

	Frame test_frame;
	test_frame.control_byte = SERVO_STATUS << 2;
	test_frame.len = 3;
	test_frame.msg[0] = 0xBA;
	test_frame.msg[1] = 0xFC;
	test_frame.msg[2] = 0xEC;
	send_frame(&test_frame);
}

bool check_parity(Frame* frame) {

	// check parity for control_byte
	uint8_t byte = frame->control_byte & 0xFE;
	bool parity_con = false;
	while(byte) {
		parity_con = !parity_con;
		byte &= (byte - 1);
	}

	// check parity for length and message bytes
	bool parity_msg = false;
	if(frame->len > 0) {
		uint8_t len = frame->len;
		while(len) {
			parity_msg = !parity_msg;
			len &= (len - 1);
		}
		for(uint8_t i = 0; i < frame->len; i++) {
			uint8_t msg = frame->msg[i];
			while(msg) {
				parity_msg = !parity_msg;
				msg &= (msg - 1);
			}
		}
	} else {
		uint8_t msg = frame->msg[0];
		while(msg) {
			parity_msg = !parity_msg;
			msg &= (msg - 1);
		}
	}

	bool result = false;
	if(((frame->control_byte & 0x01) > 0) == parity_con) {
		if(((frame->control_byte & 0x02) > 0) == parity_msg) {
			result = true;
		}
	}

	return result;
}

void calculate_parity(Frame* frame) {

	// calculate parity for length and message bytes
	bool parity_msg = false;
	if(frame->len > 0) {
		uint8_t len = frame->len;
		while(len) {
			parity_msg = !parity_msg;
			len &= (len - 1);
		}
		for(uint8_t i = 0; i < frame->len; i++) {
			uint8_t msg = frame->msg[i];
			while(msg) {
				parity_msg = !parity_msg;
				msg &= (msg - 1);
			}
		}
	} else {
		uint8_t msg = frame->msg[0];
		while(msg) {
			parity_msg = !parity_msg;
			msg &= (msg - 1);
		}
	}

	// Set parity bit for len and message
	if(parity_msg) {
		frame->control_byte |= 0x02;
	}

	// calculate parity for control_byte
	uint8_t byte = frame->control_byte;
	bool parity_con = false;
	while(byte) {
		parity_con = !parity_con;
		byte &= (byte - 1);
	}

	// Set parity bit for control_byte
	if(parity_con) {
		frame->control_byte |= 0x01;
	}

}

void get_new_frame(Frame* frame_recv) {

    // The first byte might be garbage, check for that
    uint8_t b = spi_receive_byte();
    if (b == GARBAGE) {
	    frame_recv->control_byte = spi_receive_byte();
    } else {
        frame_recv->control_byte = b;
    }


	if(frame_recv->control_byte & 0x80) { // msg is more than one byte long
		frame_recv->len = spi_receive_byte();
		for(uint8_t i = 0; i < frame_recv->len; i++) {
			frame_recv->msg[i] = spi_receive_byte();
		}
	} else { // msg is one byte long
		frame_recv->len = 0;
		frame_recv->msg[0] = spi_receive_byte();
	}
}

uint8_t get_id(Frame* frame_recv) {

	return frame_recv->control_byte >> 2;
}

bool message_require_reply(uint8_t current_msg) {

	switch(current_msg) {
		case DATA_REQUEST :
		case TOGGLE_OBSTACLE :
		case SET_SERVO_SPEED :
		case WALK_COMMAMD :
		case RETURN_TO_NEUTRAL :
			return true;
		default: return false;
	}
}

void send_frame(Frame* frame) {

	calculate_parity(frame);
	spi_transmit_byte(frame->control_byte);
	if(frame->len == 0) {
		spi_transmit_byte(frame->msg[0]);
	} else {
		spi_transmit_byte(frame->len);
		for(uint8_t i = 0; i < frame->len; i++) {
			spi_transmit_byte(frame->msg[i]);
		}
	}
}
