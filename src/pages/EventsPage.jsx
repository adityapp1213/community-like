import EventCard from "../components/events/EventCard.jsx";
import EventComposer from "../components/events/EventComposer.jsx";
import Empty from "../components/EmptyState.jsx";

export default function EventsPage({
  events,
  users,
  activity,
  act,
  go,
  currentUser,
  api,
  refresh,
  notify,
}) {
  return (
    <>
      <EventComposer api={api} refresh={refresh} notify={notify} />
      <section className="event-list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            users={users}
            activity={activity}
            act={act}
            go={go}
            currentUser={currentUser}
            api={api}
            refresh={refresh}
            notify={notify}
          />
        ))}
        {!events.length && (
          <Empty
            title="No events found"
            detail="Create an event or change your search."
          />
        )}
      </section>
    </>
  );
}
