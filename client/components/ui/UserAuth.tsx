'use client';
import { useUser, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

interface UserAuthProps {
  isOpen: boolean;
  className?: string;
}

const UserAuth = ({ isOpen, className }: UserAuthProps) => {
  const { user, isLoaded } = useUser();

  return (
    <div className={`p-3 flex items-center gap-3 border-t border-border bg-card/50 rounded-t-lg ${className || ''}`}>
      <div className="flex-shrink-0">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-6 h-6",
            }
          }}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {isOpen && isLoaded && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="min-w-0 flex-1"
          >
            <span className="block truncate text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
            </span>
            {user?.fullName && (
              <span className="block truncate text-xs text-muted-foreground/70">
                {user.fullName}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAuth;