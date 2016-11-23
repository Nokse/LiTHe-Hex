#ifndef H_SERVO
#define H_SERVO

#include <stdint.h>
#include <stdlib.h>
#include "uart_lib.h"

#include "macros.h"


#define DD_MOSI 6

//0 Indexed
#define PIN_RX_TOGGLE 2

#define DIRECTION_TX 1
#define DIRECTION_RX 0

extern const uint8_t WRITE_DATA_INSTRUCTION;
extern const uint8_t WRITE_REG_INSTRUCTIO;
extern const uint8_t ACTION_INSTRUCTION;


extern const uint8_t ANGLE_LIMIT_ADDRESS;
extern const uint8_t TORQUE_ENABLE_ADDRESS;
extern const uint8_t GOAL_POSITION_ADDRESS;


//Remember to deallocate the parameters when they go out of scope
typedef struct
{
	uint8_t id;
	uint8_t length;
	uint8_t error;

	uint8_t parameter_amount;
	uint8_t* parameters;

	uint8_t checksum;
} ServoReply;

ServoReply receive_servo_reply();


void send_servo_command(uint8_t id, uint8_t instruction, void* data, uint8_t data_amount);

void write_servo_data(uint8_t id, uint8_t address, uint8_t* data, uint8_t data_amount);


void reset_servo_max_angles(uint8_t id);

void enable_servo_torque(uint8_t id);

void set_servo_angle(uint8_t id, uint16_t angle);


#endif
