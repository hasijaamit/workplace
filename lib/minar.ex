defmodule Minar do
use Application

  def start(_type, stack) do
	:qpidpn.start()
    Stacker.Supervisor.start_link()	
  end

end
