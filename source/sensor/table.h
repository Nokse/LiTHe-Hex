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

#ifndef MAINTABLE_H
#define MAINTABLE_H 

#include "ir.h"
#include "lidar.h"

typedef struct MainTable {

    IR ir_list[NUM_SENSORS];

    uint16_t front_distance;

    uint8_t left_distance;

    uint8_t right_distance;

    float corridor_angle;

} MainTable;

void table_init(MainTable* table, IR ir_list[NUM_SENSORS]);

void update(MainTable* table, Lidar* lidar);

void send_sensor_data();

#endif /* ifndef MAINTABLE_H */
