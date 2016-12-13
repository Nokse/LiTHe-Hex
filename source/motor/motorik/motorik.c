//#define F_CPU 16000000UL

#include "avr_helper.h"

#ifndef IS_X86
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdbool.h>

#include "communication.h"
#endif
#include "spi.h"

#include "macros.h"

#include "uart_lib.h"
#include "servo.h"
#include "status.h"
#include "gangstil.h"

#include <stdint.h>
#include <stdlib.h>

CurrentStatus* current_status;
Timer* timer8;

#ifndef IS_X86
void build_spi_reply_frame(Frame *frame_trans);
void handle_spi_frame(Frame *frame_recv);

// When TIMER0 overflow increase timer8 overflow counter;
ISR(TIMER0_OVF_vect) {
	timer8->num_overflows++;
}

// If SPI receive something
ISR(SPI_STC_vect) {
    Frame frame_recv;
	on_spi_recv(&frame_recv);

	uint8_t current_msg = get_id(&frame_recv);

	if(current_msg == DATA_REQUEST) {

		Frame frame_trans;
		build_spi_reply_frame(&frame_trans);
		send_frame(&frame_trans);
	} else {

		handle_spi_frame(&frame_recv);
	}
}
#endif

void rotate_to_position(float x, float y, float r, Point2D* current)
{
	Point2D point;
	point.x = x;
	point.y = y;
	
	work_towards_goal(r, point, current);
}

int main(void)
{
    CurrentStatus status;
    current_status = &status;

    status_init(current_status);
    
    Timer timer8bit;
    timer8 = &timer8bit;
    timer_init(timer8, BIT8);

	// Enable global interrupts and init spi communication
#ifndef IS_X86
	spi_init();
	spi_set_interrupts(false);
	sei();
#endif

	set_ddr(DDRD, 0xfE);
	
	usart_init();
	
	_delay_ms(100);
	
	init_all_servos();
	
	_delay_ms(100);

	send_servo_action(0x1ff);

	_delay_ms(100);

	//test_servo_communication();

	//Initialize all legs
	
	Point2D* current_position = raise_to_default_position();
	
	assume_standardized_stance(current_position);

	// rotate_to_position(0.123, 0.99, current_position);
	// rotate_to_position(-1, -1, current_position);
	// rotate_to_position(1, 0.7, current_position);
	// rotate_to_position(1, 0.1, current_position);
	// rotate_to_position(-1, -0.45, current_position);
	// rotate_to_position(1, 0, current_position);
	// rotate_to_position(1, 1, current_position);
	// rotate_to_position(1, -1, current_position);
	// rotate_to_position(1, 0, current_position);
	//rotate_to_position(0, 0, -1, current_position);
	//rotate_to_position(0, 0, -1, current_position);
	//rotate_to_position(0, 0, 0, current_position);
	//rotate_to_position(0, 0, 1, current_position);
	//rotate_to_position(0, 0, 1, current_position);
	
	//while (1) {
	//	rotate_to_position(1, 0, 0, current_position);
	//}
	
	//while(1){
	
#ifndef IS_X86
	
	spi_set_interrupts(true);

	while(1)
	{
		
        if (current_status->return_to_neutral) {

            current_status->return_to_neutral = false;
            assume_standardized_stance(current_position);

        } else {
            Point2D goal;

			spi_set_interrupts(false);
            float x_speed = current_status->x_speed;
            float y_speed = current_status->y_speed;
            float rotation = current_status->rotation;
            float servo_speed = current_status->servo_speed;
            bool auto_mode = current_status->auto_mode;
			spi_set_interrupts(true);
			
            if (x_speed != 0.0 || y_speed != 0.0 || !auto_mode) {

                goal.x = x_speed;
                goal.y = y_speed;
				
				//spi_set_interrupts(false);
                work_towards_goal(rotation, goal, current_position);
				//spi_set_interrupts(true);

            } else if (rotation != 0) {
				//spi_set_interrupts(false);
                rotate_set_angle(rotation * (M_PI / 1), current_position);
				//spi_set_interrupts(true);
            }
        }
	//	uint32_t i = 0;
	//	while (i < 10000) {
	//		i++;
	//	}
	}
#else
	for(uint8_t i = 0; i < 40; ++i)
	{
		Point2D goal;
		goal.x = 1;
		goal.y = 0;

		//printf("Walking one step\n\n\n\n");

		work_towards_goal(0, goal, current_position);
	}
#endif

	free(current_position);
}

#ifndef IS_X86
void build_spi_reply_frame(Frame *frame_trans) {

	switch(frame_trans->msg[0]) {
		case SERVO_STATUS :
			// Send servo status data
			frame_trans->control_byte = SERVO_STATUS << 2;
			frame_trans->len = 0x05; // SET LEN OF MSG
			frame_trans->msg[0] = 0x00; // SET MSG
			break;
		case DEBUG_STRING :
			// Send servo status data
			frame_trans->control_byte = DEBUG_STRING << 2;
			frame_trans->len = 0x05; // SET LEN OF MSG
			frame_trans->msg[0] = 0x00; // SET MSG
			break;
		case BUSY_ROTATING :
			frame_trans->control_byte = BUSY_ROTATING << 2;
			frame_trans->len = 0x00;
			if (current_status->rotation > 0) {
				frame_trans->msg[0] = 0x01;
			} else {
				frame_trans->msg[0] = 0x00;
			}
	}
}

void handle_spi_frame(Frame *frame_recv) {

	switch(get_id(frame_recv)){
		case SET_SERVO_SPEED : {
			uint8_t speed_lsb = frame_recv->msg[0];
            uint8_t speed_msb = frame_recv->msg[1];
            status_set_servo_speed(current_status, speed_lsb, speed_msb);
			break;
		}
		case WALK_COMMAMD : {
			// Go command 
			uint8_t x_speed = frame_recv->msg[0];
			uint8_t y_speed = frame_recv->msg[1];
			uint8_t rotation = frame_recv->msg[2];
            uint8_t auto_mode = frame_recv->msg[3];

            status_set_speed(current_status, x_speed, y_speed);
            status_set_rotation(current_status, rotation);

            current_status->auto_mode = (bool)auto_mode;

			break;
		}
		case RETURN_TO_NEUTRAL : {
            current_status->return_to_neutral = true;
			break;
		}
	}
}

#endif
