defmodule Connect do
 	def check do
		:qpidpn.subscribe('amqp://127.0.0.1/queue://aucnet')  
		IO.puts('you have reached here successfully.')
	end
end
