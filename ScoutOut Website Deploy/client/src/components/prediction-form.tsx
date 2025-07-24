import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { predictionFormSchema, type PredictionForm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PredictionFormProps {
  onPredictionResult: (result: any) => void;
  compact?: boolean;
  detailed?: boolean;
}

export default function PredictionForm({ onPredictionResult, compact = false, detailed = false }: PredictionFormProps) {
  const { toast } = useToast();
  const [ageValue, setAgeValue] = useState([5]);

  const form = useForm<PredictionForm>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      avgAreaIncome: 75000,
      avgAreaHouseAge: 5,
      avgAreaNumberOfRooms: 7,
      avgAreaNumberOfBedrooms: 4,
      areaPopulation: 35000,
      address: "",
    },
  });

  const [timelineYears, setTimelineYears] = useState(10);

  const predictMutation = useMutation({
    mutationFn: async (data: PredictionForm & { timelineYears: number }) => {
      const response = await apiRequest("POST", "/api/predict", data);
      return response.json();
    },
    onSuccess: (result) => {
      onPredictionResult(result);
      toast({
        title: "ScoutOut Analysis Complete",
        description: `Investment Score: ${Math.round(result.investmentScore || 0)}/100`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PredictionForm) => {
    predictMutation.mutate({ ...data, timelineYears });
  };

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="avgAreaIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Area Income</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        {...field} 
                        type="number" 
                        className="input-glass pl-8" 
                        placeholder="75,000"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avgAreaHouseAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">House Age</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      className="input-glass" 
                      placeholder="5"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="avgAreaNumberOfRooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Rooms</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      className="input-glass" 
                      placeholder="7"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avgAreaNumberOfBedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Bedrooms</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      className="input-glass" 
                      placeholder="4"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="areaPopulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Area Population</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    className="input-glass" 
                    placeholder="35,000"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full apple-button"
            disabled={predictMutation.isPending}
          >
            {predictMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Predict Price
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avgAreaIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Average Area Income</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input 
                    {...field} 
                    type="number" 
                    className="input-glass pl-8" 
                    placeholder="75,000"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Median household income in the area
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="avgAreaHouseAge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">House Age (Years)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      setAgeValue(value);
                    }}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>New</span>
                    <span className="font-semibold">{field.value} years</span>
                    <span>50+ years</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="avgAreaNumberOfRooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Total Rooms</FormLabel>
                <Select value={field.value.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                  <FormControl>
                    <SelectTrigger className="input-glass">
                      <SelectValue placeholder="Select rooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="4">4 rooms</SelectItem>
                    <SelectItem value="5">5 rooms</SelectItem>
                    <SelectItem value="6">6 rooms</SelectItem>
                    <SelectItem value="7">7 rooms</SelectItem>
                    <SelectItem value="8">8 rooms</SelectItem>
                    <SelectItem value="9">9+ rooms</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avgAreaNumberOfBedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Bedrooms</FormLabel>
                <Select value={field.value.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                  <FormControl>
                    <SelectTrigger className="input-glass">
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="2">2 bedrooms</SelectItem>
                    <SelectItem value="3">3 bedrooms</SelectItem>
                    <SelectItem value="4">4 bedrooms</SelectItem>
                    <SelectItem value="5">5 bedrooms</SelectItem>
                    <SelectItem value="6">6+ bedrooms</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="areaPopulation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Area Population</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  className="input-glass" 
                  placeholder="35,000"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Local area population density
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {detailed && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Property Address (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="input-glass" 
                    placeholder="123 Main St, City, State"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full apple-button"
          disabled={predictMutation.isPending}
        >
          {predictMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          Generate Prediction
        </Button>
      </form>
    </Form>
  );
}
