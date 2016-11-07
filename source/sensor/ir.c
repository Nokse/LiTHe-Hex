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

void ir_init(IRCONTROL* control) {

    for (uint8_t i = 0; i < NUM_SENSORS; ++i) {

        IR ir;

        if (i == 0) {
            ir.range = SHORT_RANGE;
            ir.enabled = true;
        } else {
            ir.range = LONG_RANGE;
            ir.enabled = false;
        }

        ir.id = i;

        ir.port = i;
        
        ir.value = 0.0;

        control->sensors[i] = ir;
    }
}

double read(IRCONTROL* control, irport_t port) {
    
}
