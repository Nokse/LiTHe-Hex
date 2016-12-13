#include "uart_lib.h"
#ifndef IS_X86
	void usart_init()
	{
		//Set a baud-rate of 1000000
		UBRR0H = 0;
		UBRR0L = 0;

		//Enable receive + transmit
		UCSR0B = (1<<TXEN0);
		//Set frame format (1 start bit, 8 bit frames, no parity bits)
		UCSR0C = (3<<UCSZ00);
	}

	void usart_set_direction(enum UsartDirection direction)
	{
		switch (direction)
		{
		case RX:
			UCSR0B = (1<<RXEN0);
			break;
		case TX:
			UCSR0B = (1<<TXEN0);
			break;
		}
	}

	void uart_wait()
	{
		//Wait for buffer to be empty
                uint32_t time = timer_value_millis(timer8);
		while(!(UCSR0A & (1<<UDRE0)) && (timer_value_millis(timer8) - time < 100))
		{
			
		}
	}

	void usart_transmit(uint8_t data)
	{
		//Set output
		//PORTD = 0b00000000;

		//Wait for buffer to be empty
		uart_wait();
		
		UDR0 = data;
	}

	uint8_t usart_receive()
	{
		//Wait for data to arrive
                uint32_t time = timer_value_millis(timer8);
		while(!(UCSR0A & (1<<RXC0)) && (timer_value_millis(timer8) - time < 100))
		{
                    
		}

		return UDR0;
	}
#else
	void usart_init()
	{
		//printf("Initializing uart");
	}

	void uart_wait()
	{

	}

	void usart_transmit(uint8_t data)
	{
		//printf("Transmitting %#04X\n", data);
	}

	uint8_t usart_receive()
	{
		return 0;
	}

	void _delay_ms(int ms)
	{
		//printf("Delaying for %i ms \n", ms);
	}

	void usart_set_direction(enum UsartDirection direction)
	{
		switch (direction)
		{
		case RX:
			//printf("Setting usart direction to RX\n");
			break;
		case TX:
			//printf("Setting usart direction to TX\n");
			break;
		}
	}
#endif
