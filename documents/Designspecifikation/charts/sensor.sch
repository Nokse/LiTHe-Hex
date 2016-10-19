EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:sensor-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title "Sensorenheten"
Date "2016-10-19"
Rev "1.0"
Comp "LiTHe Hex"
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L ATMEGA1284-P IC?
U 1 1 57FDEFB3
P 3950 3800
F 0 "IC?" H 3100 5680 50  0001 L BNN
F 1 "ATMEGA1284-P" H 4350 1850 50  0000 L BNN
F 2 "DIL40" H 3950 3800 50  0000 C CIN
F 3 "" H 3950 3800 50  0000 C CNN
	1    3950 3800
	1    0    0    -1  
$EndComp
Text Notes 8450 3050 0    60   ~ 0
Centralenheten
Text Notes 7050 3400 0    60   Italic 0
SPI
Text Notes 5650 4550 0    60   ~ 0
JTAG
Text Notes 8750 4100 0    60   ~ 0
LIDAR
$Comp
L C 680µF
U 1 1 57FDF7AD
P 8150 4050
F 0 "680µF" H 8175 4150 50  0000 L CNN
F 1 "C" H 8175 3950 50  0001 L CNN
F 2 "" H 8188 3900 50  0000 C CNN
F 3 "" H 8150 4050 50  0000 C CNN
	1    8150 4050
	1    0    0    -1  
$EndComp
Text Label 8450 3900 0    39   ~ 0
GND
Text Label 8450 4200 0    39   ~ 0
Vcc
Text Label 8550 4450 0    39   ~ 0
SDA
Text Label 8550 4550 0    39   ~ 0
SCL
$Comp
L R R?
U 1 1 57FDFADA
P 6450 4150
F 0 "R?" V 6530 4150 50  0001 C CNN
F 1 "4.7k" V 6450 4150 50  0000 C CNN
F 2 "" V 6380 4150 50  0000 C CNN
F 3 "" H 6450 4150 50  0000 C CNN
	1    6450 4150
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR?
U 1 1 57FDFF7C
P 7850 2900
F 0 "#PWR?" H 7850 2650 50  0001 C CNN
F 1 "GND" H 7850 2750 50  0000 C CNN
F 2 "" H 7850 2900 50  0000 C CNN
F 3 "" H 7850 2900 50  0000 C CNN
	1    7850 2900
	1    0    0    -1  
$EndComp
Text Notes 7650 2150 0    60   ~ 0
GP2Y0A02YK
Text Notes 7650 2250 0    60   ~ 0
GP2Y0A02YK
Text Notes 7650 2350 0    60   ~ 0
GP2Y0A02YK
Text Notes 7650 2450 0    60   ~ 0
GP2Y0A02YK
Text Notes 7650 2550 0    60   ~ 0
GP2D120
Text Label 8300 2100 0    39   ~ 0
Vcc
Text Label 8300 2200 0    39   ~ 0
Vcc
Text Label 8300 2300 0    39   ~ 0
Vcc
Text Label 8300 2400 0    39   ~ 0
Vcc
Text Label 8300 2500 0    39   ~ 0
Vcc
$Comp
L R R?
U 1 1 57FE09D7
P 7150 2100
F 0 "R?" V 7230 2100 50  0001 C CNN
F 1 "18k" V 7150 2100 50  0000 C CNN
F 2 "" V 7080 2100 50  0000 C CNN
F 3 "" H 7150 2100 50  0000 C CNN
	1    7150 2100
	0    1    1    0   
$EndComp
$Comp
L R R?
U 1 1 57FE0AA2
P 7150 2200
F 0 "R?" V 7230 2200 50  0001 C CNN
F 1 "18k" V 7150 2200 50  0000 C CNN
F 2 "" V 7080 2200 50  0000 C CNN
F 3 "" H 7150 2200 50  0000 C CNN
	1    7150 2200
	0    1    1    0   
$EndComp
$Comp
L R R?
U 1 1 57FE0AB5
P 7150 2300
F 0 "R?" V 7230 2300 50  0001 C CNN
F 1 "18k" V 7150 2300 50  0000 C CNN
F 2 "" V 7080 2300 50  0000 C CNN
F 3 "" H 7150 2300 50  0000 C CNN
	1    7150 2300
	0    1    1    0   
$EndComp
$Comp
L R R?
U 1 1 57FE0AC8
P 7150 2400
F 0 "R?" V 7230 2400 50  0001 C CNN
F 1 "18k" V 7150 2400 50  0000 C CNN
F 2 "" V 7080 2400 50  0000 C CNN
F 3 "" H 7150 2400 50  0000 C CNN
	1    7150 2400
	0    1    1    0   
$EndComp
$Comp
L R R?
U 1 1 57FE0ADB
P 7150 2500
F 0 "R?" V 7230 2500 50  0001 C CNN
F 1 "18k" V 7150 2500 50  0000 C CNN
F 2 "" V 7080 2500 50  0000 C CNN
F 3 "" H 7150 2500 50  0000 C CNN
	1    7150 2500
	0    1    1    0   
$EndComp
$Comp
L C C?
U 1 1 57FE0F05
P 5500 2700
F 0 "C?" H 5525 2800 50  0001 L CNN
F 1 "10nF" H 5525 2600 50  0000 L CNN
F 2 "" H 5538 2550 50  0000 C CNN
F 3 "" H 5500 2700 50  0000 C CNN
	1    5500 2700
	1    0    0    -1  
$EndComp
$Comp
L C C?
U 1 1 57FE108A
P 5750 2700
F 0 "C?" H 5775 2800 50  0001 L CNN
F 1 "10nF" H 5775 2600 50  0000 L CNN
F 2 "" H 5788 2550 50  0000 C CNN
F 3 "" H 5750 2700 50  0000 C CNN
	1    5750 2700
	1    0    0    -1  
$EndComp
$Comp
L C C?
U 1 1 57FE10A3
P 6000 2700
F 0 "C?" H 6025 2800 50  0001 L CNN
F 1 "10nF" H 6025 2600 50  0000 L CNN
F 2 "" H 6038 2550 50  0000 C CNN
F 3 "" H 6000 2700 50  0000 C CNN
	1    6000 2700
	1    0    0    -1  
$EndComp
$Comp
L C C?
U 1 1 57FE10B6
P 6250 2700
F 0 "C?" H 6275 2800 50  0001 L CNN
F 1 "10nF" H 6275 2600 50  0000 L CNN
F 2 "" H 6288 2550 50  0000 C CNN
F 3 "" H 6250 2700 50  0000 C CNN
	1    6250 2700
	1    0    0    -1  
$EndComp
$Comp
L C C?
U 1 1 57FE10D1
P 6500 2700
F 0 "C?" H 6525 2800 50  0001 L CNN
F 1 "10nF" H 6525 2600 50  0000 L CNN
F 2 "" H 6538 2550 50  0000 C CNN
F 3 "" H 6500 2700 50  0000 C CNN
	1    6500 2700
	1    0    0    -1  
$EndComp
Text Notes 7900 4150 0    60   ~ 0
5V
Text Label 9050 2100 0    39   ~ 0
PD0
Text Label 9050 2200 0    39   ~ 0
PD1
Text Label 9050 2300 0    39   ~ 0
PD2
Text Label 9050 2400 0    39   ~ 0
PD3
Text Label 9050 2500 0    39   ~ 0
PD4
Text Notes 9250 3900 0    60   ~ 0
PD0...PD4
Text Notes 5050 1850 0    60   ~ 0
Gyro
Connection ~ 8550 3150
Connection ~ 8700 3150
Connection ~ 8850 3150
Connection ~ 9000 3150
Wire Wire Line
	8550 3150 8550 3400
Wire Wire Line
	8550 3400 4950 3400
Wire Wire Line
	8700 3150 8700 3500
Wire Wire Line
	8700 3500 4950 3500
Wire Wire Line
	8850 3150 8850 3600
Wire Wire Line
	8850 3600 4950 3600
Wire Wire Line
	9000 3150 9000 3700
Wire Wire Line
	9000 3700 4950 3700
Connection ~ 5700 4400
Connection ~ 5800 4400
Connection ~ 5900 4400
Connection ~ 5600 4400
Wire Wire Line
	4950 4400 5600 4400
Wire Wire Line
	4950 4300 5700 4300
Wire Wire Line
	5700 4300 5700 4400
Wire Wire Line
	4950 4200 5800 4200
Wire Wire Line
	5800 4200 5800 4400
Wire Wire Line
	4950 4100 5900 4100
Wire Wire Line
	5900 4100 5900 4400
Connection ~ 8650 3900
Connection ~ 8650 4200
Connection ~ 8150 3900
Connection ~ 8150 4200
Wire Wire Line
	7950 3900 8650 3900
Wire Wire Line
	7950 4200 8650 4200
Connection ~ 8800 4200
Connection ~ 8950 4200
Wire Wire Line
	4950 3900 7800 3900
Wire Wire Line
	7800 3900 7800 4450
Wire Wire Line
	7800 4450 8800 4450
Wire Wire Line
	8800 4450 8800 4200
Wire Wire Line
	4950 4000 7650 4000
Wire Wire Line
	7650 4000 7650 4550
Wire Wire Line
	7650 4550 8950 4550
Wire Wire Line
	8950 4550 8950 4200
Connection ~ 7950 4200
Wire Wire Line
	7950 3900 7950 3800
Wire Wire Line
	7950 3800 6850 3800
Connection ~ 6450 4000
Wire Wire Line
	6850 4300 6450 4300
Connection ~ 7850 2900
Wire Wire Line
	5450 2900 7850 2900
Connection ~ 6850 3800
Wire Wire Line
	6850 2900 6850 4300
Connection ~ 6850 2900
Connection ~ 8250 2100
Connection ~ 8250 2200
Connection ~ 8250 2300
Connection ~ 8250 2400
Connection ~ 8250 2500
Connection ~ 9200 2100
Connection ~ 9200 2200
Connection ~ 9200 2300
Connection ~ 9200 2400
Connection ~ 9200 2500
Connection ~ 7600 2100
Connection ~ 7600 2200
Connection ~ 7600 2300
Connection ~ 7600 2400
Connection ~ 7600 2500
Wire Wire Line
	8250 2100 9200 2100
Wire Wire Line
	8250 2200 9200 2200
Wire Wire Line
	8250 2300 9200 2300
Wire Wire Line
	8250 2400 9200 2400
Wire Wire Line
	8250 2500 9200 2500
Wire Wire Line
	4950 2100 7000 2100
Wire Wire Line
	4950 2200 7000 2200
Wire Wire Line
	4950 2300 7000 2300
Wire Wire Line
	4950 2400 7000 2400
Wire Wire Line
	4950 2500 7000 2500
Wire Wire Line
	7300 2100 7600 2100
Wire Wire Line
	7300 2200 7600 2200
Wire Wire Line
	7300 2300 7600 2300
Wire Wire Line
	7300 2400 7600 2400
Wire Wire Line
	7300 2500 7600 2500
Connection ~ 5500 2100
Connection ~ 5750 2200
Connection ~ 6000 2300
Connection ~ 6250 2400
Connection ~ 6500 2500
Wire Wire Line
	5500 2100 5500 2550
Wire Wire Line
	5750 2200 5750 2550
Wire Wire Line
	6000 2300 6000 2550
Wire Wire Line
	6250 2400 6250 2550
Wire Wire Line
	6500 2500 6500 2550
Connection ~ 5500 2900
Connection ~ 5750 2900
Connection ~ 6000 2900
Connection ~ 6250 2900
Connection ~ 6500 2900
Wire Wire Line
	5500 2850 5500 2900
Wire Wire Line
	5750 2850 5750 2900
Wire Wire Line
	6000 2850 6000 2900
Wire Wire Line
	6250 2850 6250 2900
Wire Wire Line
	6500 2850 6500 2900
Connection ~ 5450 2900
Connection ~ 9200 1950
Wire Bus Line
	9200 1950 9200 5650
Connection ~ 9200 5650
Wire Wire Line
	4950 4800 9200 4800
Wire Wire Line
	4950 4900 9200 4900
Wire Wire Line
	4950 5000 9200 5000
Wire Wire Line
	4950 5100 9200 5100
Wire Wire Line
	4950 5200 9200 5200
Connection ~ 9200 4800
Connection ~ 9200 4900
Connection ~ 9200 5000
Connection ~ 9200 5100
Connection ~ 9200 5200
Wire Wire Line
	4950 2600 5150 2600
Wire Wire Line
	5150 2600 5150 1900
Connection ~ 5150 1900
Text Notes 5750 1850 0    60   ~ 0
5V
Connection ~ 5700 1800
Connection ~ 5300 1800
Wire Wire Line
	5300 1800 5700 1800
Text Notes 2050 2150 0    60   ~ 0
Reset
Connection ~ 2350 2100
Wire Wire Line
	2350 2100 2950 2100
$EndSCHEMATC
