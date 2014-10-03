defmodule Database do

	 def fetchdata do
			:erlvolt.add_pool(:test_pool, [{'localhost', 21212}])
			result = :erlvolt.call_procedure(:test_pool, 'CountUsersByCountry', [3529])
			table = :erlvolt.get_table(result, 1)
			row = :erlvolt.get_row(table, 1)
			town = :erlvolt.get_string(row, table, "TOWN")
			state = :erlvolt.get_string(row, table, "STATE")
			ele = :erlvolt.get_string(row, table, "ELEVATION")
			IO.puts "my town is  #{town} and my state is  #{state} and  elevation is  #{ele}" 
			:erlvolt.close_pool(:test_pool)
	 end
	
	def insertdata do 
		:erlvolt.add_pool(:test_pool, [{'localhost', 21212}])
		:erlvolt.call_procedure(:test_pool, 'InsertDataRecords', ['Rewari', 'NG', 05, 'Haryana', 099, 6006])
		result = :erlvolt.call_procedure(:test_pool, 'CountUsersByCountry', [6000])
		table = :erlvolt.get_table(result, 1)
		row = :erlvolt.get_row(table, 1)
		town = :erlvolt.get_string(row, table, "TOWN")
		state = :erlvolt.get_string(row, table, "STATE")
		ele = :erlvolt.get_string(row, table, "ELEVATION")
		IO.puts "my town is  #{town} and my state is  #{state} and  elevation is  #{ele}" 
		:erlvolt.close_pool(:test_pool)

	end
	
	def messagedata(msg, route, name) do
		
		:erlvolt.add_pool(:test_pool, [{'localhost', 21212}])
		:erlvolt.call_procedure(:test_pool, 'InsertMessageRecords', [msg, route, name])
		result = :erlvolt.call_procedure(:test_pool, "FetchDataRecords", ["queue"])
		table = :erlvolt.get_table(result, 1)
		row = :erlvolt.get_row(table, 1)
		message = :erlvolt.get_string(row, table, "MESSAGE")
		routev = :erlvolt.get_string(row, table, "ROUTE")
		namev = :erlvolt.get_string(row, table, "NAME") 
		Stacker.Server.msgtoqueue(msg, route, name)
		:erlvolt.close_pool(:test_pool)
	end

end
