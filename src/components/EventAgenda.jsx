const EventAgenda = ({ agendaItems }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>

      <ul>
        {agendaItems.map((agenda) => (
          <li key={agenda}>{agenda}</li>
        ))}
      </ul>
    </div>
  );
};

export default EventAgenda;
