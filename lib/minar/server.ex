defmodule Stacker.Server do

  use GenServer

  # convenience method for startup
  def start_link do
    GenServer.start_link(__MODULE__, [], [{:name, __MODULE__}])
  end

  # callbacks for GenServer.Behaviour
  def init([]) do
    :inets.start()
    :qpidpn.subscribe('amqp://127.0.0.1/queue://iphone')
    {:ok, []}
  end

 def handle_call(request, _from, state) do
    {reply, new_state} = get_data(request, state)
    {:reply, reply, new_state}
  end

  def handle_cast(_msg, state) do
    {:noreply, state}
  end

  def handle_info(msg, state) do
	dbmodule msg
  	{:noreply, state}
  end

  def dbmodule(msg) do
	{a, b} = msg
	data = "#{b[:address]}"
	data = String.split(data, "//")
	[route, name] = data 
	route = String.strip(route, ?:)
	Database.messagedata(b[:body], route, name)	
  end

  def msgtoqueue(msg, route, name) do

	IO.puts "message recieved on server from database as  #{msg} from #{route} naming #{name}" 
	:qpidpn.publish(%{address: 'amqp://127.0.0.1/queue://uphone', body: 'hello frm elixir inside'})
  end

  def terminate(_reason, _state) do
    {:ok}
  end

  def code_change(_old_version, state, _extra) do
    {:ok, state}
  end

  # internal functions

  @doc """
  Given a weather station name and the current server state,
  get the weather data for that station, and add the station name
  to the state (the list of recently viewed stations).
  """

  def get_data(station, state) do
    url = "http://w1.weather.gov/xml/current_obs/" <> station
      <> ".xml"
    {status, data} = :httpc.request(to_char_list(url))
    case status do
      :error ->
        reply = {status, data}
        new_state = state
      :ok ->
        {{_http, code, _message}, _attrs, xml_as_chars} = data
        case code do
          200 ->
            xml = to_string(xml_as_chars)
            reply = {:ok,
              (for item <- [:location, :observation_time_rfc822,
              :weather, :temperature_string], do:
                get_content(item, xml))}
            # remember only the last 10 stations
            new_state = [station | Enum.take(state, 9)]
          _ ->
            reply = {:error, code}
            new_state = state
        end
    end
    {reply, new_state}
  end


  # Given an element name (as an atom) and an XML string,
  # return a tuple with the element name and that element's text
  # content.

  @spec get_content(atom, String.t) :: {atom, String.t}

  defp get_content(element_name, xml) do
    {_, pattern} = Regex.compile(
    "<#{element_name}>([^<]+)</#{Atom.to_string(element_name)}>")
    result = Regex.run(pattern, xml)
    case result do
      [_all, match] -> {element_name, match}
      nil -> {element_name, nil}
    end
  end
  
	
end
