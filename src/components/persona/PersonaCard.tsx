import { motion } from "framer-motion";

interface PersonaCardProps {
  personaId: string;
  name: string;
  avatarUrl: string;
  voiceLabel: string;
  isSelected: boolean;
  onSelect: (personaId: string) => void;
}

export const PersonaCard = ({
  personaId,
  name,
  avatarUrl,
  voiceLabel,
  isSelected,
  onSelect,
}: PersonaCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(personaId)}
      className={`
        cursor-pointer rounded-xl overflow-hidden transition-all duration-300
        ${isSelected 
          ? 'ring-4 ring-primary shadow-2xl shadow-primary/20' 
          : 'ring-1 ring-border hover:ring-2 hover:ring-primary/50'
        }
      `}
    >
      <div className="bg-card p-6">
        <div className="relative mb-4">
          <img
            src={avatarUrl}
            alt={name}
            className="w-full aspect-square object-cover rounded-lg"
          />
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-card-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{voiceLabel}</p>
      </div>
    </motion.div>
  );
};
