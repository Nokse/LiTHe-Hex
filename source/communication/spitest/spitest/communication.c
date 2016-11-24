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
//#include "../sensor/table.h"
//#include <stdio.h>

bool check_parity();

void send_reply_sensor(uint8_t current_msg);

void send_reply_motor(uint8_t current_msg);

bool message_require_reply(uint8_t current_msg);

uint8_t get_current_id(Frame* frame_recv);

void get_new_frame(Frame* frame_recv);

void send_frame(Frame* frame_send);

void send_reply_test();

void on_spi_recv() {

	Frame frame_recv;
	get_new_frame(&frame_recv);
	uint8_t current_id = get_current_id(&frame_recv);
	
	bool success = check_parity(&frame_recv); 
	if(success) { // continue if message ok
		Frame ack_frame;
		ack_frame.control_byte = 0x0F << 2;
		ack_frame.len = 0;
		ack_frame.msg[0] = 0x00;
		send_frame(&ack_frame);
	
		bool reply = message_require_reply(current_id);
		if(reply) { // send a replay to central-unit
			// TEST
			send_reply_test();
			//#ifdef TABLE_H
				//send_replay_sensor(current_id);
			//#endif
			//#ifdef //TODO send replay for motor if some file is def
				//send_replay_motor();
		} else { // 
			//#ifdef //TODO send replay for motor if some file is def
			//control_motor();
		}
	} else { // Something was wrong with message
		Frame frame_send;
		frame_send.control_byte = 0x1F << 2;
		frame_send.len = 0;
		frame_send.msg[0] = 0x00;
		send_frame(&frame_send);
	}
}

void send_reply_test() {

	Frame test_frame;
	test_frame.control_byte = 20 << 2;
	test_frame.len = 3;
	test_frame.msg[0] = 0xBA;
	test_frame.msg[0] = 0xFC;
	test_frame.msg[0] = 0xEC;
	send_frame(&test_frame);
}

bool check_parity(Frame* frame) {

	// check parity for control_byte
	uint8_t byte = frame->control_byte;
	bool parity_con = false;
	while(byte) {
		parity_con = !parity_con;
		byte &= (byte - 1);
	}

	// check parity for length and message bytes
	bool parity_msg = false;
	for(uint8_t i = 0; i < frame->len; i++) {
		uint8_t msg = frame->msg[i];
		while(msg) {
			parity_con = !parity_con;
			msg &= (msg - 1);
		}
	}
	
	return (parity_con == (frame->control_byte & 0x01)) && (parity_msg == (frame->control_byte & 0x02));
}

void calculate_parity(Frame* frame) {

	// calculate parity for length and message bytes
	bool parity_msg = false;
	for(uint8_t i = 0; i < frame->len; i++) {
		uint8_t msg = frame->msg[i];
		while(msg) {
			parity_msg = !parity_msg;
			msg &= (msg - 1);
		}
	}

	// Set parity bit for len and message
	if(parity_msg) {
		frame->control_byte | 0x02;
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
		frame->control_byte | 0x01;
	}

}

void get_new_frame(Frame* frame_recv) {

	frame_recv->control_byte = spi_receive_byte();
	//frame_recv->len = spi_receive_byte();
	//frame_recv->msg[0] =
 
	if(!(frame_recv->control_byte & 0x80)) { // msg is one byte long
		frame_recv->len = 0;
		frame_recv->msg[0] = spi_receive_byte();
	} else { // msg is more than one byte long
		frame_recv->len = spi_receive_byte();
		for(uint8_t i = 0; i < frame_recv->len; i++) {
			frame_recv->msg[i] = spi_receive_byte();
		}
	}
}

uint8_t get_current_id(Frame* frame_recv) {

	return (frame_recv->control_byte & 0xFC) >> 2;
}

bool message_require_reply(uint8_t current_msg) {

	switch(current_msg) {
		case 0x02 :
		case 0x03 :
		case 0x04 :
		case 0x20 :
		case 0x05 :
			return true;
		default: return false;
	}
}

void send_reply_sensor(uint8_t current_id) {

	Frame frame_send_1;
	Frame frame_send_2;
	if(current_id == 0x02) {
		frame_send_1.control_byte = 0x20 << 2;
	//	send_sensor_data(&frame_send_1);
		frame_send_2.control_byte = 0x21 << 2;
	//	send_sensor_wall_data(&frame_send_2);
	}
	send_frame(&frame_send_1);
	send_frame(&frame_send_2);
}

void send_frame(Frame* frame) {

	calculate_parity(frame);
	spi_transmit_byte(frame->control_byte);
	if(!frame->len) {
		spi_transmit_byte(frame->msg[0]);
		return;
	}
	spi_transmit_byte(frame->len);
	for(uint8_t i = 0; i < frame->len; i++) {
		spi_transmit_byte(frame->msg[i]);
	}
}

void control_motor(uint8_t current_msg) {

	switch(current_msg){
		case 0x03 :
			// Toggle obstacle
			break;
		case 0x04 :
			// Set speed
			break;
		case 0x20 :
			// Go command 
			break;
		case 0x05 :
			// Return to neutral
			break;
	}
}

void send_reply_motor(uint8_t current_msg) {

	Frame frame_send_status;
	Frame frame_send_string;
	Frame frame_send_obstacle;
	frame_send_status.control_byte = 0x20 << 2;
	// Send servo status
	frame_send_string.control_byte = 0x21 << 2;
	// Send debug string
	frame_send_obstacle.control_byte = 0x03 << 2;
	// Hinder here?
	send_frame(&frame_send_status);
	send_frame(&frame_send_string);
	send_frame(&frame_send_obstacle);
}