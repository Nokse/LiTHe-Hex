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

#ifndef LIDAR_H
#define LIDAR_H 

#include <avr/io.h>
#include "timer.h"

#define MONITOR_PORT    PD5
#define MONITOR_MASK    0x20
#define MONITOR_INPUT   PIND


typedef struct Lidar {

    double value;

    Timer* timer;

} Lidar;

void lidar_init(Lidar* lidar, Timer* timer);

void lidar_measure(Lidar* lidar);

#endif /* ifndef LIDAR_H */
