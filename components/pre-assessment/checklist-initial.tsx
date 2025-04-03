import { LIST_OF_QUESTIONNAIRES } from "@/const/list-of-questionnaires";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const InitialCheckListFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export default function PreAssessmentInitialCheckList() {
  const form = useForm<z.infer<typeof InitialCheckListFormSchema>>({
    resolver: zodResolver(InitialCheckListFormSchema),
    defaultValues: {
      items: [],
    },
  });

  function onSubmit(data: z.infer<typeof InitialCheckListFormSchema>) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] px-10 py-6">
          <div className="mb-4">
            <FormLabel className="text-secondary text-xl font-bold">
              What can we help you with today?
            </FormLabel>
            <FormDescription>Select all that apply</FormDescription>
          </div>

          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem className="space-y-1">
                {LIST_OF_QUESTIONNAIRES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="items"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-center px-4 py-2 gap-4 rounded-full bg-white shadow-lg"
                        >
                          {/* FIX: Later adjust entire thing to be clickable */}

                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-xs ">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-white px-10 py-3">
          <Button
            className="w-full font-bold"
            variant={"secondary"}
            type="submit"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
