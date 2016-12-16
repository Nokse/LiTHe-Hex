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
		uint32_t i = 0;
		while(!(UCSR0A & (1<<UDRE0)) && i < 100000)
		{
			i++;
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

#define USART_TIMEOUT 100000
	UartResult usart_receive()
	{
		
		//Wait for data to arrive
		uint32_t i = 0;
		while(!(UCSR0A & (1<<RXC0)) && i < USART_TIMEOUT)
		{
			i++;
		}

		UartResult result;
		result.value = UDR0;
		result.error = Ok;

		if(i == USART_TIMEOUT)
		{
			result.error = Timeout;
		}

		return result;
	}

	void clear_uart_buffer()
	{
		//Wait for data to arrive
		uint8_t buffer = 0;
		while((UCSR0A & (1<<RXC0)))
		{
			buffer = UDR0;
		}
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

	UartResult usart_receive()
	{
		UartResult result;
		result.value = 0;
		result.error = Ok;
		return result;
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

	void clear_uart_buffer()
	{
	}
#endif
