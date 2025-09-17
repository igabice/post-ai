
'use client';

import * as React from 'react';
import { ChevronsUpDown, PlusCircle, Check } from 'lucide-react';
import * as z from 'zod';

import { useApp } from '@/context/app-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

const newTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters.'),
  description: z.string().optional(),
});

export function TeamSwitcher() {
  const { user, activeTeam, switchTeam, addTeam } = useApp();
  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: z.infer<typeof newTeamSchema>) => {
    addTeam({
      name: data.name,
      description: data.description || '',
    });
    toast({
      title: 'Team Created!',
      description: `The "${data.name}" team has been created and selected.`,
    });
    setShowNewTeamDialog(false);
    form.reset();
  };


  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className="w-[200px] justify-between"
          >
            <span className="truncate">{activeTeam?.name}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup heading="Teams">
                {user.teams.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => {
                      switchTeam(team.id);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        activeTeam?.id === team.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{team.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewTeamDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                <DialogTitle>Create team</DialogTitle>
                <DialogDescription>
                    Add a new team to manage content for a different project or brand.
                </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Team name</FormLabel>
                        <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A team for our main company brand." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <DialogFooter>
                <Button variant="ghost" onClick={() => setShowNewTeamDialog(false)}>
                    Cancel
                </Button>
                <Button type="submit">Create Team</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
