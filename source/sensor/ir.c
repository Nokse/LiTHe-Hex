// Copyright 2016 Noak Ringman, Emil Segerbäck, Robin Sliwa, Frans Skarman, Hannes Tuhkala, Malcolm Wigren, Olav Övrebö

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

#include "ir.h"
#include "math.h"

void ir_init(IR ir_list[NUM_SENSORS]) {

    for (uint8_t i = 0; i < NUM_SENSORS; ++i) {

        IR ir;

        ir.range = RANGES[i];

        ir.port = i;
        
        ir.value = 0.0;

        ir_list[i] = ir;
    }
}

/* Move all element one step forward (remove first) and add a new data value last in raw_data_list */
void ir_add_data(IR* ir, uint16_t data) {

	for(uint8_t i = 0; i < NUM_SENSOR_DATA-1; i++) {
		ir->raw_data_list[i] = ir->raw_data_list[i+1];
	}
	ir->raw_data_list[NUM_SENSOR_DATA-1] = ir_value_to_meters(data, ir->range);

}

/* For now just take first value from raw_data_list put as value 
WIP: take 
*/
void ir_reduce_noise(IR* ir) {
	/*
	double weight_less[NUM_SENSOR_DATA-1] = {0.98, 0.97, 0.96, 0.95};
	double weight_more[NUM_SENSOR_DATA-1] = {1.02, 1.03, 1.04, 1.05};
	double res = ir->raw_data_list[0];
	for(uint8_t i = 1; i < NUM_SENSOR_DATA-1; i++) {
		if(((ir->raw_data_list[i-1] + ir->raw_data_list[i]) / 2 > ir->raw_data_list[i]) {
			res += ir->raw_data_list[i]*weight_less[i];
		} else if(((ir->raw_data_list[i-1] + ir->raw_data_list[i]) / 2 < ir->raw_data_list[i]) {
			res += ir->raw_data_list[i]*weight_more[i];
		}
	}
	
	ir->value = res / NUM_SENSOR_DATA;*/
	ir->value = ir->raw_data_list[0];
}

double ir_value_to_meters(uint16_t val, enum Range range) {

    if (range == LONG_RANGE) {
        
        return (LONG_BASE * pow(val, LONG_EXP)) / 100;

    } else {

        return (SHORT_BASE * pow(val, SHORT_EXP)) / 100;
    
    }
}

double latest_ir_value(IR* ir) {
    return ir->raw_data_list[NUM_SENSOR_DATA - 1];
}

