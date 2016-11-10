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

void ir_init(IR ir_list[NUM_SENSORS]) {

    for (uint8_t i = 0; i < NUM_SENSORS; ++i) {

        IR ir;

        ir.range = RANGES[i];

        ir.port = i;
        
        ir.value = 0.0;
		
		ir.raw_data_list[NUM_SENSOR_DATA];

        ir_list[i] = ir;
    }
}

/* Move all element one step forward (remove first) and add a new data value last in raw_data_list */
void ir_add_data(IR* ir, uint16_t data) {
	
	for(uint8_t i = 0; i < NUM_SENSOR_DATA-1; i++) {
		ir->raw_data_list[i] = ir->raw_data_list[i+1];
	}
	ir->raw_data_list[NUM_SENSOR_DATA] = data;
}

/* For now just take first value from raw_data_list put as value */
void ir_reduce_noise(IR* ir) {
	
	ir->value = ir->raw_data_list[0];
}
