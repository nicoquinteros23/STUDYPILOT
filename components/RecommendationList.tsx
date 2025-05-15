export default function RecommendationList({ recommendations }) {
  const { availableSubjects, priorityFinals } = recommendations

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Available Subjects</h3>
        <ul className="list-disc list-inside">
          {availableSubjects.map((subject) => (
            <li key={subject.id}>{subject.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Priority Finals</h3>
        <ul className="list-disc list-inside">
          {priorityFinals.map((subject) => (
            <li key={subject.id}>{subject.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
